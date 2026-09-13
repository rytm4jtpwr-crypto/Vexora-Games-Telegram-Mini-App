# Vexora Games

Стартовый Telegram Mini App на Node.js и TypeScript. На первом этапе проект содержит только базовый интерфейс и точку входа через Telegram-бота. Азартные игры, платежи, криптовалюта, пополнение, вывод средств и обмен игровой валюты на реальные деньги не реализованы.

## Что уже есть

- Telegram-бот на [grammY](https://grammy.dev/) с командой `/start`.
- Приветственное сообщение Vexora Games.
- Inline-кнопка `🎮 Открыть игру`, открывающая Mini App.
- Тёмная адаптивная страница Vexora Games для Telegram WebView.
- Подготовленные зоны для будущих разделов: профиль, баланс VEX, Mines, Rocket, Roulette, Cases, Daily Bonus и Leaderboard.
- Express health endpoint: `GET /api/healthz`.
- Production webhook endpoint: `POST /api/telegram/webhook`.
- TypeScript-проверка и отдельные workspace-пакеты для сервера и Mini App.

## Переменные окружения

Скопируйте шаблон для локального запуска:

```bash
cp artifacts/api-server/.env.example artifacts/api-server/.env
```

Заполните:

```env
BOT_TOKEN=токен_от_BotFather
MINI_APP_URL=https://ваш-https-url/
TELEGRAM_BOT_MODE=polling
```

Токен не нужно добавлять в код, git или сообщения. В Replit используйте Secret с именем `BOT_TOKEN`. `MINI_APP_URL` — абсолютный HTTPS-адрес, который будет открыт Telegram-кнопкой. В среде Replit разработки, если `MINI_APP_URL` не задан, бот попробует использовать `REPLIT_DEV_DOMAIN`.

В development бот использует long polling. В production используется webhook на `/api/telegram/webhook`, поэтому preview и опубликованное приложение не конфликтуют за один Telegram Bot API поток обновлений.

## Запуск

Установить зависимости:

```bash
pnpm install
```

Запустить API-сервис и бота:

```bash
pnpm --filter @workspace/api-server run dev
```

Запустить Mini App отдельно:

```bash
pnpm --filter @workspace/vexora-games run dev
```

Проверить проект:

```bash
pnpm run typecheck
pnpm run build
```

После запуска отправьте боту `/start` в Telegram. Кнопка откроет адрес из `MINI_APP_URL`.

## Структура

```text
artifacts/
├── api-server/
│   └── src/
│       ├── bot/          # grammY bot, commands, env config
│       ├── routes/       # Express API routes
│       └── index.ts      # server + bot lifecycle
└── vexora-games/
    └── src/              # React + Vite Mini App
```

Следующий этап может добавить Telegram WebApp init data validation, профиль пользователя и баланс VEX. Эти функции требуют отдельного серверного API и хранилища; в текущий этап они намеренно не включены.