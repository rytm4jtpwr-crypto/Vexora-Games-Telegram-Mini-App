import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { ChevronLeft, Gift, Diamond, Rocket, Users, ShieldAlert, X, Gauge, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { MOCK_NFTS } from '@/App';

const DEMO_NAMES = ["Lucius", "KAIR...", "meryem", "Alex", "0x...", "Doge", "CryptoKing", "VexFan", "Satoshi", "Whale"];
type Phase = 'betting' | 'flying' | 'crashed';

const width = 400;
const height = 300;

function easeOutExpo(p: number) {
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  return 1 - Math.pow(2, -10 * p);
}

function trajectoryPoint(p: number) {
  const startX = width * 0.05, startY = height * 0.78;
  const endX = width * 0.95, endY = height * 0.08;
  return {
    x: startX + (endX - startX) * p,
    y: startY + (endY - startY) * easeOutExpo(p)
  };
}

function buildTrajectoryPath(progress: number) {
  if (progress <= 0) return '';
  const steps = Math.max(2, Math.ceil(progress * 64));
  return Array.from({ length: steps + 1 }, (_, index) => {
    const point = trajectoryPoint(progress * (index / steps));
    return `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
  }).join(' ');
}

interface DemoUser {
  id: string;
  name: string;
  bet: number;
  cashoutTarget: number;
  cashedOutAt: number | null;
  avatar: string;
}

interface RocketParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

function getCrashPoint() {
  const r = Math.random();
  if (r < 0.03) return 1.00;
  const val = 0.99 / (1 - r);
  return Math.min(100, Math.max(1.00, val));
}

export default function RocketGame() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Local State for Rendering
  const [phase, setPhase] = useState<Phase>('betting');
  const [multiplier, setMultiplier] = useState(1.00);
  const [timeLeft, setTimeLeft] = useState(5.0);
  const [visualTime, setVisualTime] = useState(0);
  const [history, setHistory] = useState<number[]>([1.53, 2.40, 1.10, 5.92, 15.74]);
  const [demoUsers, setDemoUsers] = useState<DemoUser[]>([]);
  const [engineParticles, setEngineParticles] = useState<RocketParticle[]>([]);
  const [crashParticles, setCrashParticles] = useState<RocketParticle[]>([]);

  // Player State
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('vexora_balance') || 10240));
  const [betAmount, setBetAmount] = useState<string>("100");
  const [isAutoCashoutEnabled, setIsAutoCashoutEnabled] = useState(false);
  const [autoCashout, setAutoCashout] = useState<string>("2.00");
  const [stakedAmount, setStakedAmount] = useState<number>(0);
  const [winAmount, setWinAmount] = useState<number>(0);
  const [isCashedOut, setIsCashedOut] = useState<boolean>(false);
  
  const [selectedNftId, setSelectedNftId] = useState<number | null>(4);
  const [isGiftSelectorOpen, setIsGiftSelectorOpen] = useState(false);
  const [isBetDialogOpen, setIsBetDialogOpen] = useState(false);

  // Refs for Game Loop to avoid stale closures
  const gameLoopRef = useRef<number | null>(null);
  const loopState = useRef({
    phase: 'betting' as Phase,
    flightStartTime: 0,
    crashPoint: 1.00,
    timeLeft: 5.0,
    lastTick: 0,
    idleT: 0,
    starOffset: 0,
    previousProgress: 0,
    currentProgress: 0,
    crashStartTime: 0,
  });
  const demoUsersRef = useRef<DemoUser[]>([]);
  const engineParticlesRef = useRef<RocketParticle[]>([]);
  const crashParticlesRef = useRef<RocketParticle[]>([]);
  const particleIdRef = useRef(0);
  const playerRef = useRef({
    stakedAmount: 0,
    isCashedOut: false,
    autoCashout: 0,
    handleCashOut: (m: number) => {}
  });

  // Sync player refs
  playerRef.current.stakedAmount = stakedAmount;
  playerRef.current.isCashedOut = isCashedOut;
  playerRef.current.autoCashout = isAutoCashoutEnabled ? Number(autoCashout) : 0;
  playerRef.current.handleCashOut = (m: number) => {
    if (playerRef.current.isCashedOut || playerRef.current.stakedAmount <= 0) return;
    playerRef.current.isCashedOut = true;
    const win = Math.floor(playerRef.current.stakedAmount * m);
    setBalance(b => b + win);
    setWinAmount(win);
    setIsCashedOut(true);
    toast({ description: `Вы выиграли ${win} VEX!`, variant: "default" });
  };

  useEffect(() => {
    localStorage.setItem('vexora_balance', balance.toString());
  }, [balance]);

  const generateDemoUsers = () => {
    const users: DemoUser[] = [];
    const count = Math.floor(Math.random() * 5) + 3;
    for(let i=0; i<count; i++) {
      const name = DEMO_NAMES[Math.floor(Math.random() * DEMO_NAMES.length)];
      users.push({
        id: `demo-${i}`,
        name: name + (Math.random() > 0.5 ? '...' : ''),
        bet: Math.floor(Math.random() * 90) + 10,
        cashoutTarget: 1.05 + Math.random() * 3,
        cashedOutAt: null,
        avatar: `hsl(${Math.random() * 360}, 70%, 50%)`
      });
    }
    demoUsersRef.current = users;
    setDemoUsers(users);
  };

  const resetRound = () => {
    setStakedAmount(0);
    setIsCashedOut(false);
    setWinAmount(0);
    demoUsersRef.current = [];
    setDemoUsers([]);
  };

  useEffect(() => {
    const tick = (time: number) => {
      setVisualTime(time);
      if (!loopState.current.lastTick) loopState.current.lastTick = time;
      const dt = (time - loopState.current.lastTick) / 1000;
      loopState.current.lastTick = time;

      if (loopState.current.phase === 'betting') {
        loopState.current.idleT += 0.02;
        const newTime = Math.max(0, loopState.current.timeLeft - dt);
        loopState.current.timeLeft = newTime;
        setTimeLeft(newTime);

        if (newTime <= 0) {
          loopState.current.phase = 'flying';
          loopState.current.crashPoint = getCrashPoint();
          loopState.current.flightStartTime = time;
          loopState.current.previousProgress = 0;
          loopState.current.currentProgress = 0;
          loopState.current.starOffset = 0;
          engineParticlesRef.current = [];
          crashParticlesRef.current = [];
          setEngineParticles([]);
          setCrashParticles([]);
          setPhase('flying');
          setMultiplier(1.00);
          generateDemoUsers();
        }
      } else if (loopState.current.phase === 'flying') {
        const elapsed = (time - loopState.current.flightStartTime) / 1000;
        const progress = Math.min(1, 1 - 1 / (1 + elapsed * 0.35));
        loopState.current.previousProgress = loopState.current.currentProgress;
        loopState.current.currentProgress = progress;
        const point = trajectoryPoint(progress);
        // Starts gently, then accelerates as the quadratic term grows.
        const currentM = Math.exp((elapsed * 0.06) + (elapsed * elapsed * 0.012));
        loopState.current.starOffset += currentM * 0.5;

        if (currentM >= loopState.current.crashPoint) {
          loopState.current.phase = 'crashed';
          loopState.current.crashStartTime = time;
          engineParticlesRef.current = [];
          setEngineParticles([]);
          crashParticlesRef.current = Array.from({ length: 24 }, () => {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 2;
            return {
              id: particleIdRef.current++,
              x: point.x,
              y: point.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 1,
            };
          });
          setCrashParticles([...crashParticlesRef.current]);
          const finalM = loopState.current.crashPoint;
          setMultiplier(finalM);
          setPhase('crashed');
          setHistory(prev => [finalM, ...prev].slice(0, 10));

          setTimeout(() => {
            loopState.current.phase = 'betting';
            loopState.current.timeLeft = 5.0;
            setPhase('betting');
            resetRound();
          }, 4500);
        } else {
          setMultiplier(currentM);

          if (Math.random() < 0.6) {
            engineParticlesRef.current.push({
              id: particleIdRef.current++,
              x: point.x,
              y: point.y,
              vx: (Math.random() - 0.5) * 1.5,
              vy: Math.random() * 1.5 + 1,
              life: 1,
            });
          }
          engineParticlesRef.current.forEach((particle) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.03;
          });
          engineParticlesRef.current = engineParticlesRef.current.filter(
            (particle) => particle.life > 0,
          );
          setEngineParticles([...engineParticlesRef.current]);
          
          if (playerRef.current.stakedAmount > 0 && 
              !playerRef.current.isCashedOut && 
              playerRef.current.autoCashout > 0 && 
              currentM >= playerRef.current.autoCashout) {
            playerRef.current.handleCashOut(playerRef.current.autoCashout);
          }
          
          let demoChanged = false;
          demoUsersRef.current.forEach(u => {
            if (!u.cashedOutAt && currentM >= u.cashoutTarget) {
              u.cashedOutAt = currentM;
              demoChanged = true;
            }
          });
          if (demoChanged) {
            setDemoUsers([...demoUsersRef.current]);
          }
        }
      } else if (loopState.current.phase === 'crashed') {
        crashParticlesRef.current.forEach((particle) => {
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.vy += 0.15;
          particle.life -= 0.02;
        });
        crashParticlesRef.current = crashParticlesRef.current.filter(
          (particle) => particle.life > 0,
        );
        setCrashParticles([...crashParticlesRef.current]);
      }
      gameLoopRef.current = requestAnimationFrame(tick);
    };

    gameLoopRef.current = requestAnimationFrame(tick);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, []);

  const handlePlaceBet = (): boolean => {
    const amt = Number(betAmount);
    if (isNaN(amt) || amt <= 0) {
      toast({ description: "Неверная сумма", variant: "destructive" });
      return false;
    }
    if (amt > balance) {
      toast({ description: "Недостаточно VEX", variant: "destructive" });
      return false;
    }
    if (isAutoCashoutEnabled) {
      const target = Number(autoCashout);
      if (!Number.isFinite(target) || target < 1.01 || target > 99.99) {
        toast({ description: "Автовывод должен быть от 1.01x до 99.99x", variant: "destructive" });
        return false;
      }
    }
    
    setBalance(b => b - amt);
    setStakedAmount(amt);
    setIsCashedOut(false);
    setWinAmount(0);
    return true;
  };

  const handleCancelBet = () => {
    setBalance(b => b + stakedAmount);
    setStakedAmount(0);
  };

  const selectedNft = MOCK_NFTS.find(n => n.id === selectedNftId);
  const flightProgress = phase === 'betting' ? 0 : loopState.current.currentProgress;
  const trajectoryPath = buildTrajectoryPath(flightProgress);
  const currentTrajectoryPoint = trajectoryPoint(flightProgress);
  const previousPoint = trajectoryPoint(loopState.current.previousProgress);
  const angle = Math.atan2(
    currentTrajectoryPoint.y - previousPoint.y,
    currentTrajectoryPoint.x - previousPoint.x,
  ) + Math.PI / 2;
  const idleRotation = Math.sin(loopState.current.idleT) * 0.1 * (180 / Math.PI);
  const idleOffsetY = Math.sin(loopState.current.idleT * 1.3) * 6;
  const flightWobble = Math.sin(visualTime * 0.006) * 0.06;
  const rocketLeft = 50;
  const rocketTop = 50;
  const rocketRotation = 0;
  const rocketOffsetY = 0;
  const countdownValue = Math.max(1, Math.ceil(timeLeft));
  const countdownProgress = Math.max(0, Math.min(1, timeLeft / 5));
  const boostProgress = multiplier < 2
    ? 0
    : Math.min(100, (multiplier - 2) * 10);
  const showCenteredMultiplier = phase === 'crashed' || (phase === 'flying' && rocketTop < 7);
  return (
    <div className="flex flex-col h-[100dvh] bg-background text-foreground overflow-hidden">
      <style>{`
        @keyframes particle-fly {
          0% { transform: translate(10vw, -10vh) scale(0.5); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translate(-30vw, 40vh) scale(1.5); opacity: 0; }
        }
        .particle {
          position: absolute;
          background: white;
          border-radius: 50%;
          width: 3px;
          height: 3px;
          animation: particle-fly linear infinite;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Header */}
      <header className="flex-none flex items-center justify-between px-4 py-3 bg-background/90 backdrop-blur-lg border-b border-border/50 sticky top-0 z-50">
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 rounded-full"
          onClick={() => setLocation('/')}
          aria-label="Вернуться на главную"
        >
          <ChevronLeft size={20} />
        </Button>
        
        <button 
          onClick={() => setIsGiftSelectorOpen(true)}
          className="bg-card flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 hover:bg-primary/5 transition-colors"
          aria-label="Выбрать Gift для полёта"
        >
          <Gift size={14} className="text-primary" />
          <span className="text-xs font-bold font-sans">{selectedNft ? selectedNft.name : 'Выбрать Gift'}</span>
        </button>
        
        <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
          <Diamond size={12} className="text-primary" />
          <span className="font-bold font-mono text-sm leading-none">{balance.toLocaleString()}</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto hide-scrollbar flex flex-col">
        {/* Graph Area */}
        <div className={`rocket-stage relative h-[300px] w-full shrink-0 overflow-hidden border-b border-border/50 shadow-inner phase-${phase}`}>
          
          <div className="rocket-aurora" />
          <div
            className="rocket-stars"
            style={{
              backgroundPosition: `12px ${18 + loopState.current.starOffset}px, 45px ${68 + loopState.current.starOffset}px`,
            }}
          />

          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
            {phase !== 'betting' && trajectoryPath && (
              <path
                d={trajectoryPath}
                fill="none"
                stroke={phase === 'crashed' ? "rgba(239,68,68,0.8)" : "#786cff"}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="rocket-trajectory"
              />
            )}
          </svg>

          <div className="rocket-particle-layer" aria-hidden="true">
            {engineParticles.map((particle) => (
              <span
                key={particle.id}
                className="rocket-engine-particle"
                style={{
                  left: `${(particle.x / width) * 100}%`,
                  top: `${(particle.y / height) * 100}%`,
                  opacity: particle.life,
                }}
              />
            ))}
            {crashParticles.map((particle) => (
              <span
                key={particle.id}
                className="rocket-crash-particle"
                style={{
                  left: `${(particle.x / width) * 100}%`,
                  top: `${(particle.y / height) * 100}%`,
                  opacity: particle.life,
                }}
              />
            ))}
          </div>

          <div
            className={`rocket-vehicle absolute z-20 ${phase === 'flying' ? 'is-flying' : ''} ${phase === 'crashed' ? 'is-crashed' : ''}`}
            style={{
              left: `${rocketLeft}%`,
              top: `${rocketTop}%`,
              transform: `translate(-50%, -50%) translateY(${rocketOffsetY}px) rotate(${rocketRotation}deg)`,
            }}
          >
            <div className="rocket-shell">
              <video
                className="rocket-animation-video"
                src="/assets/animated-rocket.mp4"
                poster="/assets/animated-rocket-poster.jpg"
                autoPlay
                loop
                muted
                playsInline
                aria-label="Анимированная ракета Vexora"
              />
            </div>
            {phase === 'crashed' && (
              <div className="rocket-explosion" aria-label="Ракета остановилась">
              </div>
            )}
          </div>

          <div className={`rocket-boost-meter ${boostProgress > 0 ? 'is-active' : ''}`} aria-hidden="true">
            <span style={{ height: `${boostProgress}%` }} />
          </div>
          
          <div className={`rocket-readout ${phase === 'betting' ? 'is-countdown' : ''} ${showCenteredMultiplier ? 'is-result' : ''}`}>
            {phase === 'betting' ? (
              <div className="rocket-countdown" style={{ '--countdown-progress': countdownProgress } as CSSProperties}>
                <span>{countdownValue}</span>
              </div>
            ) : (
              showCenteredMultiplier && <div className="rocket-result-value">{multiplier.toFixed(2)}x</div>
            )}
          </div>
        </div>

        {/* History Row */}
        <div className="flex gap-2 overflow-x-auto p-3 bg-card border-b border-border/50 hide-scrollbar shrink-0">
          {history.map((m, i) => (
            <div key={i} className={`shrink-0 px-3 py-1 rounded-full text-[0.65rem] font-black font-mono border tracking-wider ${
              m >= 10.0 ? 'bg-purple-500/20 text-purple-400 border-purple-500/40' :
              m >= 2.0 ? 'bg-green-500/10 text-green-500 border-green-500/30' :
              m >= 1.5 ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' :
              'bg-red-500/10 text-red-500 border-red-500/30'
            }`}>
              {m.toFixed(2)}x
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="p-4 bg-background shrink-0">
          <div className="flex gap-3 mb-4">
            <div className="flex-[3] bg-card rounded-2xl p-3 flex items-center gap-3 border border-border shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <Diamond size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-[0.6rem] text-muted-foreground uppercase font-black tracking-wider">Сумма ставки</p>
                <p className="text-xl font-black font-mono">{stakedAmount > 0 ? stakedAmount : betAmount} VEX</p>
              </div>
            </div>
            
            <div className="flex-[2] bg-card rounded-2xl p-3 border border-border flex flex-col justify-center shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[0.65rem] text-muted-foreground uppercase font-black tracking-wider">Автовывод</span>
                <Switch 
                  checked={isAutoCashoutEnabled} 
                  onCheckedChange={setIsAutoCashoutEnabled}
                  disabled={phase !== 'betting' || stakedAmount > 0}
                  className="scale-75 origin-right"
                />
              </div>
              <Input 
                type="number" 
                min="1.01"
                max="99.99"
                step="0.01"
                value={autoCashout} 
                onChange={e => setAutoCashout(e.target.value)}
                disabled={!isAutoCashoutEnabled || phase !== 'betting' || stakedAmount > 0}
                className="h-8 border-0 bg-background shadow-inner focus-visible:ring-0 text-sm font-bold font-mono px-2"
              />
            </div>
          </div>

          <Button 
            className={`w-full h-16 text-lg font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all active:scale-[0.98] ${
              phase === 'betting' && stakedAmount === 0 ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20' :
              phase === 'betting' && stakedAmount > 0 ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30' :
              phase === 'flying' && stakedAmount > 0 && !isCashedOut ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-900/40' :
              'bg-secondary text-secondary-foreground opacity-50'
            }`}
            onClick={() => {
              if (phase === 'betting') {
                if (stakedAmount > 0) handleCancelBet();
                else setIsBetDialogOpen(true);
              } else if (phase === 'flying') {
                if (stakedAmount > 0 && !isCashedOut) {
                  playerRef.current.handleCashOut(multiplier);
                }
              }
            }}
            disabled={(phase === 'flying' && (stakedAmount === 0 || isCashedOut)) || phase === 'crashed'}
          >
            {phase === 'betting' && stakedAmount === 0 && 'Сделать ставку'}
            {phase === 'betting' && stakedAmount > 0 && 'Отменить ставку'}
            {phase === 'flying' && stakedAmount > 0 && !isCashedOut && `Забрать ${Math.floor(stakedAmount * multiplier)} VEX`}
            {phase === 'flying' && (stakedAmount === 0 || isCashedOut) && 'Летим...'}
            {phase === 'crashed' && stakedAmount > 0 && !isCashedOut && 'Ставка сгорела'}
            {phase === 'crashed' && (stakedAmount === 0 || isCashedOut) && 'Ожидание...'}
          </Button>
        </div>

        {/* Participants */}
        <div className="flex-1 px-4 pb-12 flex flex-col gap-2">
          <h3 className="text-xs font-black text-muted-foreground uppercase flex items-center gap-2 mb-2 tracking-wider">
            <Users size={14}/> Участники
          </h3>
          
          {stakedAmount > 0 && (
            <div className={`flex items-center justify-between p-3 rounded-xl border animate-pop-in ${isCashedOut ? 'bg-green-500/10 border-green-500/30' : phase === 'crashed' ? 'bg-red-500/10 border-red-500/30' : 'bg-primary/10 border-primary/30'}`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-[10px] font-black text-primary-foreground">ВЫ</span>
                </div>
                <span className="font-bold text-sm">Вы</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Diamond size={12} className="text-primary"/>
                  <span className="font-mono text-sm font-bold">{stakedAmount}</span>
                </div>
                {isCashedOut && (
                  <span className="font-mono font-black text-green-500 bg-green-500/10 px-2 py-0.5 rounded">{(winAmount / stakedAmount).toFixed(2)}x</span>
                )}
              </div>
            </div>
          )}

          {demoUsers.map(u => (
            <div key={u.id} className={`flex items-center justify-between p-3 rounded-xl border ${u.cashedOutAt ? 'bg-green-500/5 border-green-500/20' : phase === 'crashed' ? 'bg-red-500/5 border-red-500/10 opacity-50' : 'bg-card border-border'}`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: u.avatar }}></div>
                <span className="font-medium text-sm text-foreground/80">{u.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Diamond size={12} className="text-primary opacity-50"/>
                  <span className="font-mono text-sm text-muted-foreground">{u.bet.toFixed(0)}</span>
                </div>
                {u.cashedOutAt && (
                  <span className="font-mono font-bold text-green-500 text-xs px-2 py-0.5 rounded bg-green-500/10">{u.cashedOutAt.toFixed(2)}x</span>
                )}
              </div>
            </div>
          ))}
          
          <div className="mt-8 mb-4 flex flex-col items-center gap-2 opacity-50">
            <ShieldAlert size={16} className="text-muted-foreground" />
            <p className="text-[10px] text-muted-foreground text-center max-w-[250px] leading-tight">
              VEX — бесплатная игровая валюта без реальной стоимости. Gifts используются только визуально и никогда не ставятся на кон.
            </p>
          </div>
        </div>
      </main>

      {/* Gift Selector Dialog Overlay */}
      {isGiftSelectorOpen && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-pop-in">
          <div className="bg-card w-full max-w-sm rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border/50 flex justify-between items-center bg-secondary/30">
              <h2 className="font-black tracking-wide uppercase text-sm">Выбрать Gift</h2>
              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full" onClick={() => setIsGiftSelectorOpen(false)}>
                <span className="text-lg font-mono">&times;</span>
              </Button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3 overflow-y-auto max-h-[60vh]">
              {MOCK_NFTS.map(nft => (
                <div 
                  key={nft.id} 
                  onClick={() => {
                    setSelectedNftId(nft.id);
                    setIsGiftSelectorOpen(false);
                  }} 
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 cursor-pointer transition-all active:scale-95 ${selectedNftId === nft.id ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(139,92,246,0.2)]' : 'border-border bg-background hover:border-primary/30'}`}
                >
                  <img src={nft.image} alt={nft.name} className="w-14 h-14 object-contain drop-shadow-lg" />
                  <span className="text-xs font-bold text-center leading-tight">{nft.name}</span>
                </div>
              ))}
            </div>
            <div className="p-4 bg-secondary/20 text-center">
              <p className="text-[10px] text-muted-foreground">Gift отображается в полёте и никогда не списывается.</p>
            </div>
          </div>
        </div>
      )}

      {isBetDialogOpen && (
        <div className="fixed inset-0 z-[110] bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-3 animate-pop-in">
          <div className="bet-dialog bg-card w-full max-w-sm rounded-[1.75rem] border border-primary/25 shadow-[0_0_50px_rgba(139,92,246,0.25)] overflow-hidden">
            <div className="p-5 flex items-start justify-between border-b border-border/60">
              <div>
                <p className="text-[0.65rem] text-primary uppercase tracking-[0.2em] font-black mb-1">Rocket</p>
                <h2 className="text-xl font-black">Укажите сумму ставки</h2>
                <p className="text-xs text-muted-foreground mt-1">Доступно {balance.toLocaleString()} VEX</p>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsBetDialogOpen(false)} aria-label="Закрыть">
                <X size={18} />
              </Button>
            </div>

            <div className="p-5">
              <div className="relative">
                <Diamond className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
                <Input
                  autoFocus
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max={balance}
                  value={betAmount}
                  onChange={(event) => setBetAmount(event.target.value)}
                  className="h-16 rounded-2xl bg-background border-primary/20 pl-12 pr-16 text-2xl font-black font-mono focus-visible:ring-primary"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-muted-foreground">VEX</span>
              </div>

              <div className="grid grid-cols-4 gap-2 mt-3">
                {[10, 50, 100, 500].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setBetAmount(String(Math.min(amount, balance)))}
                    className="h-10 rounded-xl bg-secondary hover:bg-primary/20 border border-border text-sm font-black transition-colors"
                  >
                    {amount}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 mt-4 text-[0.65rem] text-muted-foreground">
                <Gauge size={14} className="text-primary shrink-0" />
                <span>После подтверждения ставку можно отменить до старта.</span>
              </div>

              <Button
                className="w-full h-14 mt-5 rounded-2xl bg-primary hover:bg-primary/90 text-base font-black uppercase tracking-wider"
                onClick={() => {
                  if (handlePlaceBet()) {
                    setIsBetDialogOpen(false);
                  }
                }}
              >
                <Check size={19} />
                Подтвердить ставку
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
