# Vexora Games

Telegram Mini App starter with a grammY bot, a dark game hub interface, and a structure prepared for future demo-only game modules.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server and Telegram bot
- `pnpm --filter @workspace/vexora-games run dev` — run the Mini App frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required secret: `BOT_TOKEN` — Telegram Bot API token, stored in Replit Secrets
- Optional env: `MINI_APP_URL` — absolute HTTPS URL for the Telegram Mini App button

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Telegram Bot API: grammY
- Configuration: dotenv-compatible `.env` files for local development

## Where things live

- `artifacts/api-server/src/bot/` — Telegram bot configuration and handlers
- `artifacts/api-server/src/routes/` — HTTP API routes, including `/api/healthz`
- `artifacts/vexora-games/src/` — Mini App React interface
- `artifacts/api-server/.env.example` — local environment template
- `README.md` — setup and launch instructions

## Architecture decisions

- The Telegram bot runs beside the Express API service so one workflow owns the server-side process.
- The Mini App URL is configured with `MINI_APP_URL`; development falls back to the current Replit dev domain.
- No database, balance, payment, currency, or game engine is included in the first stage.
- Future game areas are represented as coming-soon UI states, not fake playable mechanics.

## Product

Vexora Games currently provides a Telegram `/start` entry point and a responsive Mini App hub that introduces the future product areas: VEX balance, profile, Mines, Rocket, Roulette, Cases, Daily Bonus, and Leaderboard.

## User preferences

- Keep the first stage free of real money, cryptocurrency, withdrawals, exchange, and gambling mechanics.

## Gotchas

- Telegram requires an absolute HTTPS URL for an inline Mini App button. Set `MINI_APP_URL` for a stable URL; the bot uses `REPLIT_DEV_DOMAIN` in development when available.
- Never put `BOT_TOKEN` in source code or commit a real `.env` file.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
