import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Coins, UserRound } from 'lucide-react';
import { useLocation } from 'wouter';

type Phase = 'betting' | 'flying' | 'crashed';

type Participant = {
  id: number;
  name: string;
  amount: number;
  multiplier: number | null;
};

const ROUND_HISTORY = [1.01, 2.04, 2.77, 1.19, 11, 2.76];
const MOCK_PARTICIPANTS: Participant[] = [
  { id: 1, name: 'Maxim', amount: 100, multiplier: 2.04 },
  { id: 2, name: 'Alina', amount: 250, multiplier: 2.77 },
  { id: 3, name: 'Vexor', amount: 80, multiplier: null },
];

function getTrajectoryPoint(progress: number) {
  const t = Math.max(0, Math.min(1, progress));
  const start = { x: 24, y: 79 };
  const control = { x: 55, y: 78 };
  const end = { x: 78, y: 21 };
  const inverse = 1 - t;

  return {
    x: inverse * inverse * start.x + 2 * inverse * t * control.x + t * t * end.x,
    y: inverse * inverse * start.y + 2 * inverse * t * control.y + t * t * end.y,
  };
}

function historyClass(value: number) {
  if (value >= 10) return 'is-high';
  if (value >= 2) return 'is-medium';
  return 'is-low';
}

export default function RocketGame() {
  const [, setLocation] = useLocation();
  const [phase, setPhase] = useState<Phase>('betting');
  const [countdown, setCountdown] = useState(5);
  const [multiplier, setMultiplier] = useState(1);
  const [history, setHistory] = useState(ROUND_HISTORY);
  const [betAmount, setBetAmount] = useState(100);
  const [balance, setBalance] = useState(() => {
    const saved = Number(localStorage.getItem('vexora_balance'));
    return Number.isFinite(saved) ? saved : 10240;
  });
  const [activeBet, setActiveBet] = useState<number | null>(null);
  const [cashedOutAt, setCashedOutAt] = useState<number | null>(null);
  const stageRef = useRef<HTMLElement>(null);
  const trajectoryRef = useRef<SVGPathElement>(null);
  const vehicleRef = useRef<HTMLDivElement>(null);
  const explosionRef = useRef<HTMLDivElement>(null);
  const multiplierRef = useRef(1);
  const phaseRef = useRef<Phase>('betting');
  const roundRef = useRef(0);

  const updateBalance = useCallback((next: number) => {
    const rounded = Math.max(0, Math.round(next));
    setBalance(rounded);
    localStorage.setItem('vexora_balance', String(rounded));
  }, []);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    multiplierRef.current = multiplier;
  }, [multiplier]);

  useEffect(() => {
    if (phase !== 'betting') return;
    setCountdown(5);
    setMultiplier(1);
    multiplierRef.current = 1;
    setCashedOutAt(null);

    const interval = window.setInterval(() => {
      setCountdown((value) => {
        if (value <= 1) {
          window.clearInterval(interval);
          setPhase('flying');
          return 1;
        }
        return value - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [phase, roundRef.current]);

  useEffect(() => {
    if (phase !== 'flying') return;

    const startedAt = performance.now();
    const crashAt = Math.min(25, Math.max(1.2, 1 + Math.pow(Math.random(), 2.2) * 13));
    let frame = 0;
    let lastRender = 0;

    const tick = (now: number) => {
      const elapsed = now - startedAt;
      const nextMultiplier = Math.min(crashAt, Math.exp(elapsed / 8500));
      multiplierRef.current = nextMultiplier;

      if (now - lastRender > 45 || nextMultiplier >= crashAt) {
        setMultiplier(nextMultiplier);
        lastRender = now;
      }

      if (nextMultiplier >= crashAt) {
        setMultiplier(crashAt);
        setPhase('crashed');
        setHistory((current) => [crashAt, ...current].slice(0, 8));
        return;
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  useEffect(() => {
    let frame = 0;
    let displayedProgress = 0;

    const animateVehicle = (time: number) => {
      const currentPhase = phaseRef.current;
      const currentMultiplier = multiplierRef.current;
      const targetProgress =
        currentPhase === 'betting'
          ? 0
          : currentPhase === 'crashed'
            ? displayedProgress
            : Math.min(
                1,
                Math.pow(Math.log(Math.max(currentMultiplier, 1)) / Math.log(100), 0.72),
              );

      displayedProgress += (targetProgress - displayedProgress) * 0.08;
      const trajectory = trajectoryRef.current;
      const trajectoryLength = trajectory?.getTotalLength() ?? 0;
      const point = trajectoryLength
        ? trajectory!.getPointAtLength(trajectoryLength * displayedProgress)
        : getTrajectoryPoint(displayedProgress);
      const previous = trajectoryLength
        ? trajectory!.getPointAtLength(trajectoryLength * Math.max(0, displayedProgress - 0.008))
        : getTrajectoryPoint(Math.max(0, displayedProgress - 0.008));
      const stageWidth = stageRef.current?.clientWidth ?? 100;
      const stageHeight = stageRef.current?.clientHeight ?? 100;
      const tangent = Math.atan2(
        (point.y - previous.y) * stageHeight,
        (point.x - previous.x) * stageWidth,
      ) * (180 / Math.PI);
      const wobble = Math.sin(time / 90) * 1.5;

      if (vehicleRef.current) {
        vehicleRef.current.style.left = `${point.x}%`;
        vehicleRef.current.style.top = `${point.y}%`;
        vehicleRef.current.style.transform =
          `translate(-50%, -50%) rotate(${tangent + 90 + wobble}deg)`;
      }
      if (explosionRef.current) {
        explosionRef.current.style.left = `${point.x}%`;
        explosionRef.current.style.top = `${point.y}%`;
      }

      frame = requestAnimationFrame(animateVehicle);
    };

    frame = requestAnimationFrame(animateVehicle);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (phase !== 'crashed') return;
    const timeout = window.setTimeout(() => {
      setActiveBet(null);
      roundRef.current += 1;
      setPhase('betting');
    }, 2800);
    return () => window.clearTimeout(timeout);
  }, [phase]);

  const handlePrimaryAction = () => {
    if (phase === 'betting') {
      if (activeBet !== null || betAmount <= 0 || betAmount > balance) return;
      updateBalance(balance - betAmount);
      setActiveBet(betAmount);
      return;
    }

    if (phase === 'flying' && activeBet !== null && cashedOutAt === null) {
      const cashoutMultiplier = multiplierRef.current;
      updateBalance(balance + activeBet * cashoutMultiplier);
      setCashedOutAt(cashoutMultiplier);
      setActiveBet(null);
    }
  };

  const actionLabel =
    phase === 'betting'
      ? activeBet === null
        ? 'Сделать ставку'
        : `Ставка ${activeBet} VEX принята`
      : phase === 'flying' && activeBet !== null
        ? `Забрать ${(activeBet * multiplier).toFixed(0)} VEX`
        : phase === 'crashed'
          ? 'Раунд завершён'
          : 'Ожидание нового раунда';

  return (
    <div className="rocket-page">
      <header className="rocket-page-header">
        <button type="button" onClick={() => setLocation('/')} aria-label="Назад">
          <ArrowLeft size={21} />
        </button>
        <div>
          <strong>Rocket</strong>
          <span>Vexora Games</span>
        </div>
        <div className="rocket-balance">
          <Coins size={15} />
          {balance.toLocaleString()} VEX
        </div>
      </header>

      <main className="rocket-content">
        <section ref={stageRef} className={`rocket-stage phase-${phase}`}>
          <div className="rocket-aurora" />
          <div className="rocket-stars" />

          <svg className="rocket-flight-path" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path
              ref={trajectoryRef}
              className="rocket-trajectory"
              d="M 24 79 Q 55 78 78 21"
              pathLength="1"
              style={{ '--flight-progress': Math.min(1, Math.log(Math.max(multiplier, 1)) / Math.log(100)) } as React.CSSProperties}
            />
          </svg>

          <div ref={vehicleRef} className="rocket-vehicle">
            <div className="rocket-flame">
              <div className="rocket-flame-glow" />
              <div className="rocket-flame-core" />
              <div className="rocket-flame-particles">
                <i />
                <i />
                <i />
                <i />
              </div>
            </div>
            <img
              className="rocket-model-image"
              src={`${import.meta.env.BASE_URL}assets/neon-rocket-model.png`}
              alt="Неоновая ракета Vexora"
            />
          </div>

          <div className={`rocket-readout ${phase === 'betting' ? 'is-countdown' : 'is-result'}`}>
            {phase === 'betting' ? (
              <div
                className="rocket-countdown"
                style={{ '--countdown-progress': countdown / 5 } as React.CSSProperties}
              >
                <span>{countdown}</span>
              </div>
            ) : (
              <>
                <div className="rocket-result-value">{multiplier.toFixed(2)}x</div>
                {phase === 'crashed' && <div className="rocket-crashed-label">УЛЕТЕЛА</div>}
              </>
            )}
          </div>

          {phase === 'crashed' && (
            <div ref={explosionRef} className="rocket-explosion" aria-hidden="true">
              <div className="explosion-burst" />
              <div className="explosion-orbit" />
              <div className="explosion-orbit orbit-two" />
              <div className="explosion-orbit orbit-three" />
            </div>
          )}

          <div className="rocket-history">
            {history.map((value, index) => (
              <span key={`${value}-${index}`} className={historyClass(value)}>
                {value.toFixed(value >= 10 ? 1 : 2)}x
              </span>
            ))}
          </div>
        </section>

        <section className="rocket-bet-panel">
          <div className="rocket-bet-label">
            <span>Сумма ставки</span>
            <label className="rocket-bet-custom">
              <input
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                value={betAmount || ''}
                onChange={(event) => {
                  const nextAmount = Number(event.target.value);
                  setBetAmount(Number.isFinite(nextAmount) ? Math.max(0, nextAmount) : 0);
                }}
                disabled={phase !== 'betting' || activeBet !== null}
                aria-label="Сумма ставки VEX"
              />
              <span>VEX</span>
            </label>
          </div>
          <div className="rocket-bet-controls">
            {[50, 100, 250, 500].map((amount) => (
              <button
                type="button"
                key={amount}
                className={betAmount === amount ? 'is-active' : ''}
                onClick={() => setBetAmount(amount)}
                disabled={phase !== 'betting' || activeBet !== null}
              >
                {amount}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="rocket-primary-action"
            onClick={handlePrimaryAction}
            disabled={
              (phase === 'betting' && (activeBet !== null || betAmount > balance)) ||
              (phase === 'flying' && activeBet === null) ||
              phase === 'crashed'
            }
          >
            {actionLabel}
          </button>
          {cashedOutAt !== null && (
            <p className="rocket-win-message">Вы забрали ставку на {cashedOutAt.toFixed(2)}x</p>
          )}
        </section>

        <section className="rocket-participants">
          <div className="rocket-section-title">
            <span>Участники</span>
            <small>{MOCK_PARTICIPANTS.length + (activeBet ? 1 : 0)} игроков</small>
          </div>
          {activeBet !== null && (
            <div className="rocket-participant is-you">
              <span className="rocket-avatar"><UserRound size={17} /></span>
              <span><strong>Вы</strong><small>{activeBet} VEX</small></span>
              <em>{cashedOutAt ? `${cashedOutAt.toFixed(2)}x` : 'В игре'}</em>
            </div>
          )}
          {MOCK_PARTICIPANTS.map((participant) => (
            <div className="rocket-participant" key={participant.id}>
              <span className="rocket-avatar"><UserRound size={17} /></span>
              <span><strong>{participant.name}</strong><small>{participant.amount} VEX</small></span>
              <em>{participant.multiplier ? `${participant.multiplier.toFixed(2)}x` : 'В игре'}</em>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}