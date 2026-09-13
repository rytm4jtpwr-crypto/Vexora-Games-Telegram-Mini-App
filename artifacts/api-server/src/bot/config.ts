import "dotenv/config";

const BOT_TOKEN_KEY = "BOT_TOKEN";
const MINI_APP_URL_KEY = "MINI_APP_URL";

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

  const devDomain = process.env.REPLIT_DEV_DOMAIN?.trim();
  if (devDomain) {
    return `https://${devDomain}/`;
  }

  throw new Error(
    `${MINI_APP_URL_KEY} is required when REPLIT_DEV_DOMAIN is unavailable.`,
  );
}