import type { Bot } from "grammy";
import { logger } from "../lib/logger";
import { createTelegramBot } from "./create-bot";

let bot: Bot | undefined;

export async function startTelegramBot(): Promise<void> {
  bot = createTelegramBot();

  bot.catch((error) => {
    logger.error({ err: error.error }, "Telegram bot update failed");
  });

  await bot.api.setMyCommands([
    { command: "start", description: "Открыть Vexora Games" },
  ]);

  void bot.start({
    onStart: (info) => {
      logger.info({ username: info.username }, "Telegram bot started");
    },
  });
}

export async function stopTelegramBot(): Promise<void> {
  if (!bot) {
    return;
  }

  await bot.stop();
  bot = undefined;
  logger.info("Telegram bot stopped");
}