import { type CSSProperties, type ReactNode, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ArrowDown,
  ArrowRight,
  CircleDot,
  Gift,
  PackageOpen,
  Pickaxe,
  Rocket,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { initializeTelegramWebApp } from '@/lib/telegram';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

type Module = {
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
};

const modules: Module[] = [
  { name: 'Mines', description: 'Проверь интуицию', icon: Pickaxe, color: '73 100% 64%' },
  { name: 'Rocket', description: 'Поймай момент', icon: Rocket, color: '12 100% 69%' },
  { name: 'Roulette', description: 'Решает случай', icon: CircleDot, color: '249 72% 72%' },
  { name: 'Cases', description: 'Открой неизвестное', icon: PackageOpen, color: '182 72% 61%' },
  { name: 'Daily Bonus', description: 'Возвращайся каждый день', icon: Gift, color: '38 100% 68%' },
  { name: 'Leaderboard', description: 'Сравни свой результат', icon: Trophy, color: '321 76% 72%' },
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function Home() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const handleModuleSelect = (name: string) => {
    setSelectedModule(name);
    window.setTimeout(() => setSelectedModule(null), 3400);
  };

  return (
    <main className="vexora-app">
      <div className="vexora-content">
        <header
          className="sticky top-0 z-20 border-b border-[hsl(228_20%_30%/0.55)] bg-[hsl(230_27%_7%/0.78)] backdrop-blur-xl"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <div className="container flex h-[4.7rem] items-center justify-between gap-4">
            <a
              className="group flex items-center gap-3 rounded-lg"
              href="#top"
              data-testid="link-brand"
              aria-label="Vexora Games — в начало"
            >
              <span className="grid h-9 w-9 place-items-center rounded-[0.65rem] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] transition-transform duration-200 group-hover:-rotate-6">
                <span className="mono text-sm font-medium">VX</span>
              </span>
              <span className="text-[0.98rem] font-bold tracking-[-0.04em] text-[hsl(48_38%_97%)]">
                Vexora <span className="text-[hsl(var(--primary))]">Games</span>
              </span>
            </a>

            <nav className="hidden items-center gap-7 md:flex" aria-label="Основная навигация">
              <a
                className="mono rounded-md px-2 py-1 text-[0.63rem] uppercase tracking-[0.08em] text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--primary))]"
                href="#modules"
                data-testid="link-modules"
              >
                Модули
              </a>
              <a
                className="mono rounded-md px-2 py-1 text-[0.63rem] uppercase tracking-[0.08em] text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--primary))]"
                href="#about"
                data-testid="link-about"
              >
                О запуске
              </a>
            </nav>

            <button
              className="button-quiet min-h-0 px-3 py-2 text-[0.71rem]"
              type="button"
              onClick={() => scrollToSection('modules')}
              data-testid="button-header-modules"
            >
              Смотреть модули <ArrowRight size={14} aria-hidden="true" />
            </button>
          </div>
        </header>

        <section id="top" className="container hero-grid" aria-labelledby="hero-title">
          <div className="hero-orb" aria-hidden="true" />
          <div className="relative z-[1]">
            <div className="eyebrow animate-rise" data-testid="status-demo">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" aria-hidden="true" />
              демо-режим · запуск скоро
            </div>
            <h1 id="hero-title" className="hero-title animate-rise delay-1">
              Играй
              <br />
              <em>на опережение.</em>
            </h1>
            <p className="hero-copy animate-rise delay-2">
              Vexora Games — компактный игровой хаб внутри Telegram. Здесь соберутся быстрые
              модули, ясные правила и место для твоего следующего результата.
            </p>
            <div className="hero-actions animate-rise delay-3">
              <button
                className="button-primary"
                type="button"
                onClick={() => scrollToSection('modules')}
                data-testid="button-explore-modules"
              >
                Открыть каталог <ArrowDown size={17} aria-hidden="true" />
              </button>
              <button
                className="button-quiet"
                type="button"
                onClick={() => scrollToSection('about')}
                data-testid="button-how-it-works"
              >
                Как это работает
              </button>
            </div>
            <div className="hero-meta animate-rise delay-3" aria-label="Статистика запуска">
              <div className="hero-meta-item">
                <span>06</span>
                <span>модулей в планах</span>
              </div>
              <div className="hero-meta-item">
                <span>01</span>
                <span>место для старта</span>
              </div>
              <div className="hero-meta-item">
                <span>100%</span>
                <span>фокус на игре</span>
              </div>
            </div>
          </div>

          <div className="terminal-card animate-rise delay-2" aria-label="Превью состояния Vexora Games">
            <div className="terminal-topbar">
              <span className="terminal-dot" aria-hidden="true" />
              <span>VEXORA / SYSTEM PREVIEW</span>
            </div>
            <div className="terminal-body">
              <div className="terminal-kicker">[ СТАТУС СИСТЕМЫ ]</div>
              <h2 className="terminal-heading">
                Игры
                <br />
                <strong>собираются.</strong>
              </h2>
              <div className="terminal-line">
                <span>доступность модулей</span>
                <span>скоро</span>
              </div>
            </div>
          </div>
        </section>

        <div className="ticker" aria-label="Информационная строка">
          <span className="container flex items-center gap-4">
            <strong>VEXORA GAMES</strong>
            <span className="ticker-mark" aria-hidden="true">/</span>
            <span>Первый релиз уже в сборке</span>
            <span className="ticker-mark" aria-hidden="true">/</span>
            <span>Игровые модули появятся здесь</span>
          </span>
        </div>

        <section id="modules" className="container section scroll-mt-20" aria-labelledby="modules-title">
          <div className="section-heading">
            <div>
              <div className="eyebrow">каталог / 01</div>
              <h2 id="modules-title" className="section-title">
                Шесть способов
                <br />
                <span className="text-[hsl(var(--primary))]">проверить себя.</span>
              </h2>
            </div>
            <p className="section-note">
              Выбери карточку, чтобы увидеть её состояние. Каждый модуль пока находится в
              подготовке — это честный превью-режим.
            </p>
          </div>

          <div className="module-grid" role="list" aria-label="Будущие игровые модули">
            {modules.map((module, index) => {
              const Icon = module.icon;
              const isSelected = selectedModule === module.name;
              return (
                <button
                  key={module.name}
                  className="module-card"
                  style={
                    {
                      '--module-color': module.color,
                      '--module-glow': `hsl(${module.color} / 0.13)`,
                    } as CSSProperties
                  }
                  data-selected={isSelected}
                  type="button"
                  onClick={() => handleModuleSelect(module.name)}
                  aria-label={`${module.name}: ${module.description}. Скоро`}
                  data-testid={`button-module-${module.name.toLowerCase().replace(' ', '-')}`}
                >
                  <span className="module-index">0{index + 1}</span>
                  <span className="module-icon" aria-hidden="true">
                    <Icon size={20} strokeWidth={1.8} />
                  </span>
                  <span>
                    <h3>{module.name}</h3>
                    <p>{module.description}</p>
                  </span>
                  <span className="module-status">
                    <span className="status-pip" aria-hidden="true" />
                    скоро
                  </span>
                </button>
              );
            })}
          </div>
          <p className="selection-message" role="status" aria-live="polite" data-testid="status-module-selection">
            {selectedModule ? `${selectedModule} отмечен для будущего запуска.` : 'Нажми на модуль — он сохранится в фокусе.'}
          </p>
        </section>

        <section id="about" className="container section scroll-mt-20" aria-labelledby="about-title">
          <div className="preview-panel">
            <div>
              <div className="eyebrow">что дальше / 02</div>
              <h2 id="about-title" className="preview-title">
                Никаких обещаний.
                <br />
                Только чистый старт.
              </h2>
              <p className="preview-copy">
                Мы собираем ядро Vexora Games по частям, чтобы каждый будущий модуль был быстрым,
                понятным и одинаково удобным на маленьком экране Telegram и на десктопе.
              </p>
              <div className="hero-actions">
                <button
                  className="button-primary"
                  type="button"
                  onClick={() => scrollToSection('modules')}
                  data-testid="button-return-to-catalog"
                >
                  Вернуться к модулям <ArrowRight size={17} aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="signal-list" aria-label="Принципы запуска">
              <div className="signal-row">
                <span>Игровые модули</span>
                <strong>готовятся</strong>
              </div>
              <div className="signal-row">
                <span>Платежи и ставки</span>
                <strong>отсутствуют</strong>
              </div>
              <div className="signal-row">
                <span>Первый доступ</span>
                <strong>скоро</strong>
              </div>
              <div className="signal-row">
                <span>Формат</span>
                <strong>Telegram Mini App</strong>
              </div>
            </div>
          </div>
        </section>

        <footer className="container footer" style={{ paddingBottom: 'max(2.4rem, env(safe-area-inset-bottom))' }}>
          <span className="footer-brand">Vexora Games</span>
          <small>Демо-режим · игра появится позже · 2024—2025</small>
        </footer>
      </div>
    </main>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
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