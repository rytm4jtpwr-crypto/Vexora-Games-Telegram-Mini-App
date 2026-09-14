import { type ReactNode, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Rocket,
  Pickaxe,
  CircleDot,
  PackageOpen,
  Gift,
  Trophy,
  Gamepad2,
  Zap,
  TrendingUp,
  User,
  Star,
  Users,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import RocketGame from '@/pages/rocket';
import RouletteGame from '@/pages/roulette';
import { initializeTelegramWebApp } from '@/lib/telegram';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

// --- Mock Data ---

export const MOCK_NFTS = [
  { id: 1, name: 'Scared Cat', image: '/assets/cat.png', rarity: 'Legendary' },
  { id: 2, name: "Durov's Cap", image: '/assets/cap.png', rarity: 'Rare' },
  { id: 3, name: 'Mighty Arm', image: '/assets/arm.png', rarity: 'Epic' },
  { id: 4, name: 'Plush Pepe', image: '/assets/pepe.png', rarity: 'Legendary' },
  { id: 5, name: 'Hooded Gift', image: '/assets/hood.png', rarity: 'Mythic' },
];

const MODULES = [
  { id: 'rocket', name: 'Rocket', label: 'ХИТ', icon: Rocket, type: 'wide', theme: 'card-v-blue', multiplier: 'x10.5' },
  { id: 'cases', name: 'Gift Cases', label: 'GIFTS', icon: PackageOpen, type: 'wide', theme: 'card-v-orange' },
  { id: 'mines', name: 'Mines', icon: Pickaxe, type: 'square', theme: 'card-v-green' },
  { id: 'roulette', name: 'Roulette', icon: CircleDot, type: 'square', theme: 'card-v-purple' },
  { id: 'bonus', name: 'Daily Bonus', icon: Gift, type: 'square', theme: 'card-v-yellow', label: 'СКОРО' },
  { id: 'leaders', name: 'Leaderboard', icon: Trophy, type: 'square', theme: 'card-v-pink' },
];

// --- Views ---

function HubView() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [balance] = useState(() => {
    const saved = Number(localStorage.getItem('vexora_balance'));
    return Number.isFinite(saved) ? saved : 10240;
  });
  const filters = ['Все игры', 'Хиты', 'Подарки', 'Бесплатно', 'Новое'];
  const [activeFilter, setActiveFilter] = useState(filters[0]);

  const handleModuleClick = (mod: typeof MODULES[0]) => {
    if (mod.id === 'rocket') {
      setLocation('/rocket');
      return;
    }
    if (mod.id === 'roulette') {
      setLocation('/roulette');
      return;
    }
    toast({
      title: `${mod.name} запускается`,
      description: 'Этот модуль сейчас в разработке.',
      variant: 'default',
    });
  };

  return (
    <div className="flex flex-col gap-4 pb-24 pt-2 px-4 animate-pop-in">
      
      {/* TON Header */}
      <div className="flex items-center justify-between glass-panel rounded-2xl p-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full overflow-hidden border border-sky-400/40 shadow-[0_0_14px_rgba(0,152,219,0.25)]">
            <img
              src={`${import.meta.env.BASE_URL}assets/ton-coin.webp`}
              alt="TON"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-[0.65rem] text-muted-foreground uppercase tracking-wider font-mono">Ваши очки</p>
            <p className="font-bold text-lg leading-tight">{balance.toLocaleString()} <span className="text-sky-400 text-sm">TON</span></p>
          </div>
        </div>
        <button 
          onClick={() => toast({ description: 'TON появятся после запуска.' })}
          className="bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
        >
          О TON
        </button>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 snap-x">
        {filters.map((filter) => (
          <button 
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors snap-center ${
              activeFilter === filter ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
            aria-pressed={activeFilter === filter}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-2 gap-3">
        
        {/* ROCKET (Full Width) */}
        <div 
          onClick={() => handleModuleClick(MODULES[0])}
          className="col-span-2 bento-card card-v-blue h-36 p-4 flex flex-col justify-between relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute inset-0 card-pattern-grid opacity-20"></div>
          <div className="absolute -right-4 -bottom-4 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform"></div>
          
          <div className="relative z-10 flex justify-between items-start">
            <span className="bg-white/20 backdrop-blur-md px-2 py-1 rounded text-xs font-bold tracking-wider uppercase flex items-center gap-1">
              <Zap size={12} /> {MODULES[0].label}
            </span>
            <div className="flex gap-2">
               <span className="badge-float bg-green-500/80 text-white px-2 py-1 rounded-lg text-xs font-bold backdrop-blur-md shadow-lg">{MODULES[0].multiplier}</span>
               <span className="badge-float bg-blue-400/80 text-white px-2 py-1 rounded-lg text-xs font-bold backdrop-blur-md shadow-lg delay-150">x2.20</span>
            </div>
          </div>
          
          <div className="relative z-10 flex items-end justify-between">
            <h2 className="text-3xl font-black uppercase tracking-tight italic flex items-center gap-2 text-glow">
              <Rocket size={32} className="text-white" />
              {MODULES[0].name}
            </h2>
          </div>
        </div>

        {/* GIFT CASES (Full Width) */}
        <div 
          onClick={() => handleModuleClick(MODULES[1])}
          className="col-span-2 bento-card card-v-orange h-28 p-4 flex items-center justify-between relative cursor-pointer group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
          <div className="relative z-10">
             <h2 className="text-2xl font-black uppercase tracking-tight italic flex items-center gap-2 text-glow">
               <PackageOpen size={24} className="text-white" />
              {MODULES[1].name}
            </h2>
          </div>
          <div className="relative z-10 flex -space-x-3">
             <div className="w-14 h-14 rounded-xl bg-black/40 border border-white/20 backdrop-blur-md flex items-center justify-center p-1 transform -rotate-6 overflow-hidden">
                <img src="/assets/cat.png" alt="" className="h-12 w-12 object-contain" />
             </div>
             <div className="w-14 h-14 rounded-xl bg-black/40 border border-white/20 backdrop-blur-md flex items-center justify-center p-1 transform rotate-6 z-10 overflow-hidden">
                <img src="/assets/pepe.png" alt="" className="h-12 w-12 object-contain" />
             </div>
          </div>
        </div>

        {/* MINES & ROULETTE (Half Width each) */}
        <div 
          onClick={() => handleModuleClick(MODULES[2])}
          className="col-span-1 bento-card card-v-green aspect-square p-4 flex flex-col items-center justify-center relative cursor-pointer"
        >
           <div className="w-14 h-14 rounded-2xl bg-black/20 flex items-center justify-center mb-3 backdrop-blur-md border border-white/10 shadow-inner">
              <Pickaxe size={28} className="text-current" />
           </div>
           <h3 className="font-bold text-lg text-center uppercase tracking-wide">{MODULES[2].name}</h3>
        </div>

        <div 
          onClick={() => handleModuleClick(MODULES[3])}
          className="col-span-1 bento-card card-v-purple aspect-square p-4 flex flex-col items-center justify-center relative cursor-pointer"
        >
           <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-3 backdrop-blur-md border border-white/10 shadow-inner">
              <CircleDot size={28} className="text-white" />
           </div>
           <h3 className="font-bold text-lg text-center uppercase tracking-wide">{MODULES[3].name}</h3>
        </div>

        {/* NFT Showcase (Full Width) */}
        <div className="col-span-2 bento-card card-dark p-0 flex flex-col mt-2">
           <div className="p-4 pb-2 flex justify-between items-center">
              <h3 className="font-bold text-lg">Epic Gifts</h3>
              <button className="text-xs text-primary font-medium flex items-center gap-1">Все <ChevronRight size={14}/></button>
           </div>
           <div className="flex gap-3 overflow-x-auto pb-4 px-4 snap-x">
             {MOCK_NFTS.map((nft) => (
                <div key={nft.id} className="snap-center shrink-0 w-24 flex flex-col items-center gap-2 group cursor-pointer">
                   <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-secondary to-background border border-border p-2 flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 group-hover:border-primary/50 relative overflow-hidden">
                      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <img src={nft.image} alt={nft.name} className="w-16 h-16 object-contain filter drop-shadow-md z-10" />
                   </div>
                   <span className="text-xs font-medium text-center text-muted-foreground group-hover:text-foreground transition-colors line-clamp-1 w-full">{nft.name}</span>
                </div>
             ))}
           </div>
        </div>

        {/* FREE 24H & CASES */}
        <div 
          onClick={() => handleModuleClick(MODULES[4])}
          className="col-span-1 bento-card card-dark border-yellow-500/30 aspect-square p-4 flex flex-col items-center justify-between relative cursor-pointer"
        >
           <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-yellow-500/10 to-transparent"></div>
           <span className="bg-yellow-500 text-black px-2 py-0.5 rounded text-[0.6rem] font-bold tracking-widest self-start uppercase">FREE</span>
           <Gift size={40} className="text-yellow-500 filter drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
           <div className="w-full">
               <p className="text-xs text-muted-foreground font-mono">Каждый день</p>
               <h3 className="font-bold text-base uppercase">Daily Bonus</h3>
           </div>
        </div>

        <div 
          onClick={() => handleModuleClick(MODULES[5])}
          className="col-span-1 bento-card card-dark border-pink-500/30 aspect-square p-4 flex flex-col items-center justify-between relative cursor-pointer"
        >
           <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-pink-500/10 to-transparent"></div>
            <span className="bg-pink-500/20 text-pink-400 px-2 py-0.5 rounded text-[0.6rem] font-bold tracking-widest self-start uppercase border border-pink-500/30">TOP</span>
            <Trophy size={40} className="text-pink-400 filter drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]" />
           <div className="w-full">
               <p className="text-xs text-muted-foreground font-mono">Лучшие игроки</p>
               <h3 className="font-bold text-base uppercase">Leaderboard</h3>
           </div>
        </div>

      </div>
    </div>
  );
}

function EmptyStateView({ title, icon: Icon }: { title: string; icon: any }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-pop-in h-[70vh]">
      <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
        <Icon size={32} className="text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-muted-foreground">Этот раздел находится в разработке. Скоро здесь появится новый функционал.</p>
    </div>
  );
}

// --- Main App Component ---

function Home() {
  const [activeTab, setActiveTab] = useState('hub');

  return (
    <div className="flex flex-col h-[100dvh] bg-background text-foreground overflow-x-hidden">
      
      {/* Sticky Header - Telegram App style */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-lg border-b border-border/50 px-4 py-3 flex items-center justify-between" style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}>
         <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
               <span className="font-mono text-xs font-bold text-primary-foreground">VX</span>
            </div>
            <span className="font-bold tracking-tight text-sm">Vexora</span>
         </div>
         <div className="flex items-center gap-3">
            <button className="text-muted-foreground hover:text-foreground transition-colors">
               <ShieldAlert size={18} />
            </button>
            <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center border border-border">
               <User size={14} className="text-muted-foreground" />
            </div>
         </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'hub' && <HubView />}
        {activeTab === 'gifts' && <EmptyStateView title="Подарки и Инвентарь" icon={PackageOpen} />}
        {activeTab === 'leaders' && <EmptyStateView title="Рейтинг Игроков" icon={Trophy} />}
        {activeTab === 'profile' && <EmptyStateView title="Профиль" icon={User} />}
      </main>

      {/* Bottom Nav */}
      <nav className="bottom-nav">
        <div className="flex items-center justify-around h-16 px-2">
          {[
            { id: 'hub', label: 'Главная', icon: Gamepad2 },
            { id: 'gifts', label: 'Инвентарь', icon: PackageOpen },
            { id: 'leaders', label: 'Рейтинг', icon: Trophy },
            { id: 'profile', label: 'Профиль', icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-all ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground/80'
                }`}
              >
                <div className={`relative p-1 rounded-xl transition-all ${isActive ? 'bg-primary/10' : ''}`}>
                   <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                   {tab.id === 'gifts' && !isActive && (
                     <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-accent rounded-full border-2 border-background"></span>
                   )}
                </div>
                <span className="text-[0.65rem] font-medium tracking-wide">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
      
    </div>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/rocket" component={RocketGame} />
        <Route path="/roulette" component={RouletteGame} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  useEffect(() => {
    initializeTelegramWebApp();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
