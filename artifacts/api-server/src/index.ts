import app from "./app";
import { startTelegramBot, stopTelegramBot } from "./bot";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
  void startTelegramBot().catch((error: unknown) => {
    logger.error({ err: error }, "Telegram bot failed to start");
  });
});

const shutdown = async (signal: string) => {
  logger.info({ signal }, "Shutdown requested");
  await stopTelegramBot();
  process.exit(0);
};

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));
