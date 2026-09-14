import { useMemo, useRef, useState } from 'react';
import { ArrowLeft, CircleDot, Gem, Sparkles, Star } from 'lucide-react';
import { useLocation } from 'wouter';

const ITEM_WIDTH = 126;
const ITEM_GAP = 16;

const PLACEHOLDER_ITEMS = [
  { id: 'ton', label: 'TON', icon: Gem, tone: 'violet' },
  { id: 'star', label: 'Star', icon: Star, tone: 'blue' },
  { id: 'plush-pepe', label: 'Plush Pepe', video: 'plush-pepe.mp4', tone: 'gold' },
  { id: 'snoop-silver', label: 'Snoop Dogg', video: 'snoop-dogg-silver.mp4', tone: 'gold' },
  { id: 'snoop-sport', label: 'Snoop Dogg', video: 'snoop-dogg-sport.mp4', tone: 'blue' },
  { id: 'mood-pack', label: 'Mood Pack', video: 'mood-pack.mp4', tone: 'pink' },
  { id: 'cupid-skull', label: 'Cupid Charm', video: 'cupid-charm-skull.mp4', tone: 'blue' },
  { id: 'cupid-jewels', label: 'Cupid Charm', video: 'cupid-charm-jewels.mp4', tone: 'pink' },
  { id: 'toy-bear', label: 'Toy Bear', video: 'toy-bear.mp4', tone: 'violet' },
  { id: 'sharp-tongue', label: 'Sharp Tongue', video: 'sharp-tongue.mp4', tone: 'violet' },
  { id: 'scared-cat', label: 'Scared Cat', video: 'scared-cat.mp4', tone: 'blue' },
  { id: 'mighty-arm', label: 'Mighty Arm', video: 'mighty-arm.mp4', tone: 'gold' },
];

export default function RouletteGame() {
  const [, setLocation] = useLocation();
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinCount, setSpinCount] = useState(0);
  const [balance, setBalance] = useState(() => {
    const saved = Number(localStorage.getItem('vexora_balance'));
    return Number.isFinite(saved) ? saved : 10240;
  });

  const reelItems = useMemo(
    () => Array.from({ length: 48 }, (_, index) => ({
      ...PLACEHOLDER_ITEMS[index % PLACEHOLDER_ITEMS.length],
      reelId: `${index}-${PLACEHOLDER_ITEMS[index % PLACEHOLDER_ITEMS.length].id}`,
    })),
    [],
  );

  const setTrackPosition = (index: number, animate: boolean) => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return;

    const centerOffset = viewport.clientWidth / 2 - ITEM_WIDTH / 2;
    const offset = centerOffset - index * (ITEM_WIDTH + ITEM_GAP);
    track.style.transition = animate
      ? 'transform 4.6s cubic-bezier(0.12, 0.72, 0.08, 1)'
      : 'none';
    track.style.transform = `translate3d(${offset}px, 0, 0)`;
  };

  const spin = () => {
    if (isSpinning || balance < 1) return;

    const nextBalance = balance - 1;
    setBalance(nextBalance);
    localStorage.setItem('vexora_balance', String(nextBalance));
    setIsSpinning(true);

    const startIndex = 2 + (spinCount % PLACEHOLDER_ITEMS.length);
    const targetIndex = 21 + Math.floor(Math.random() * 4);
    setTrackPosition(startIndex, false);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => setTrackPosition(targetIndex, true));
    });

    window.setTimeout(() => {
      setIsSpinning(false);
      setSpinCount((count) => count + 1);
    }, 4700);
  };

  return (
    <div className="roulette-page">
      <header className="roulette-header">
        <button type="button" onClick={() => setLocation('/')} aria-label="Назад">
          <ArrowLeft size={21} />
        </button>
        <div>
          <strong>Roulette</strong>
          <span>Vexora Games</span>
        </div>
        <div className="roulette-balance">
          <img src={`${import.meta.env.BASE_URL}assets/ton-coin.webp`} alt="" />
          {balance.toLocaleString()} TON
        </div>
      </header>

      <main className="roulette-main">
        <div className="roulette-glow roulette-glow-top" />
        <div className="roulette-glow roulette-glow-bottom" />

        <section className="roulette-machine" aria-label="Рулетка призов">
          <div className="roulette-pointer">
            <span />
          </div>
          <div ref={viewportRef} className="roulette-viewport">
            <div ref={trackRef} className="roulette-track">
              {reelItems.map(({ reelId, label, icon: Icon, video, tone }) => (
                <div className={`roulette-item tone-${tone}`} key={reelId}>
                  <div className="roulette-item-art">
                    {video ? (
                      <video
                        src={`${import.meta.env.BASE_URL}assets/roulette-gifts/${video}`}
                        poster={`${import.meta.env.BASE_URL}assets/roulette-gifts/${video.replace('.mp4', '.jpg')}`}
                        autoPlay
                        loop
                        muted
                        playsInline
                        aria-label={label}
                      />
                    ) : (
                      <>
                        {Icon && <Icon size={58} strokeWidth={1.7} />}
                        <Sparkles className="roulette-item-spark" size={20} />
                      </>
                    )}
                  </div>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="roulette-controls">
          <div className="roulette-chances">
            <span className="is-active"><CircleDot size={13} /> 1× шанс</span>
            <span>10×</span>
            <span>100×</span>
          </div>
          <button
            type="button"
            className="roulette-spin-button"
            onClick={spin}
            disabled={isSpinning || balance < 1}
          >
            {isSpinning ? 'Крутится…' : balance < 1 ? 'Недостаточно TON' : 'Крутить за 1 TON'}
          </button>
          <p>Star, TON и коллекционные NFT-подарки</p>
        </section>
      </main>
    </div>
  );
}