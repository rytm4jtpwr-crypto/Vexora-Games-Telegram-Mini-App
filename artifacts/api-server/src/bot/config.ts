import "dotenv/config";

const BOT_TOKEN_KEY = "BOT_TOKEN";
const MINI_APP_URL_KEY = "MINI_APP_URL";
const TELEGRAM_BOT_MODE_KEY = "TELEGRAM_BOT_MODE";
const TELEGRAM_WEBHOOK_URL_KEY = "TELEGRAM_WEBHOOK_URL";

export type TelegramBotMode = "polling" | "webhook";

export function getBotToken(): string {
  const token = process.env[BOT_TOKEN_KEY]?.trim();

  if (!token) {
    throw new Error(
      `${BOT_TOKEN_KEY} is required. Add it to Replit Secrets or a local .env file.`,
    );
  }

  return token;
}

export function getMiniAppUrl(): string {
  const configuredUrl = process.env[MINI_APP_URL_KEY]?.trim();
  if (configuredUrl) {
    return configuredUrl;
  }

  const publishedDomains = process.env.REPLIT_DOMAINS
    ?.split(",")
    .map((domain) => domain.trim())
    .find(Boolean);
  if (publishedDomains) {
    return `https://${publishedDomains}/`;
  }

  const devDomain = process.env.REPLIT_DEV_DOMAIN?.trim();
  if (devDomain) {
    return `https://${devDomain}/`;
  }

  throw new Error(
    `${MINI_APP_URL_KEY} is required when REPLIT_DEV_DOMAIN is unavailable.`,
  );
}

export function getTelegramBotMode(): TelegramBotMode {
  const configuredMode = process.env[TELEGRAM_BOT_MODE_KEY]?.trim();
  if (configuredMode === "polling" || configuredMode === "webhook") {
    return configuredMode;
  }

  return process.env.NODE_ENV === "production" ? "webhook" : "polling";
}

export function getTelegramWebhookUrl(): string {
  const configuredUrl = process.env[TELEGRAM_WEBHOOK_URL_KEY]?.trim();
  if (configuredUrl) {
    return configuredUrl;
  }

  const miniAppUrl = new URL(getMiniAppUrl());
  return new URL("/api/telegram/webhook", miniAppUrl.origin).toString();
}