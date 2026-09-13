import type { Bot } from "grammy";
import { logger } from "../lib/logger";
import {
  getMiniAppUrl,
  getTelegramBotMode,
  getTelegramWebhookUrl,
} from "./config";
import { createTelegramBot } from "./create-bot";

let bot: Bot | undefined;

export async function startTelegramBot(): Promise<void> {
  bot = createTelegramBot();

  bot.catch((error) => {
    logger.error({ err: error.error }, "Telegram bot update failed");
  });

  await bot.init();
  await bot.api.setMyCommands([
    { command: "start", description: "Открыть Vexora Games" },
  ]);
  await bot.api.setChatMenuButton({
    menu_button: {
      type: "web_app",
      text: "Открыть Vexora Games",
      web_app: { url: getMiniAppUrl() },
    },
  });

  if (getTelegramBotMode() === "webhook") {
    const webhookUrl = getTelegramWebhookUrl();
    await bot.api.setWebhook(webhookUrl, { drop_pending_updates: true });
    logger.info({ webhookUrl }, "Telegram webhook configured");
    return;
  }

  void bot
    .start({
      onStart: (info) => {
        logger.info({ username: info.username }, "Telegram bot started");
      },
    })
    .catch((error: unknown) => {
      logger.error(
        { err: error },
        "Telegram polling stopped; another bot instance may be active",
      );
    });
}

export async function handleTelegramUpdate(
  update: Parameters<Bot["handleUpdate"]>[0],
): Promise<void> {
  if (!bot) {
    throw new Error("Telegram bot is not initialized");
  }

  await bot.handleUpdate(update);
}

export async function stopTelegramBot(): Promise<void> {
  if (!bot) {
    return;
  }

  await bot.stop();
  bot = undefined;
  logger.info("Telegram bot stopped");
}