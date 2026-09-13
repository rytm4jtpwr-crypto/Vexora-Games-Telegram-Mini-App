import { Bot, InlineKeyboard } from "grammy";
import { getBotToken, getMiniAppUrl } from "./config";

const welcomeMessage = [
  "Добро пожаловать в Vexora Games.",
  "",
  "Это игровой Telegram-хаб вокруг коллекционных NFT-подарков.",
  "",
  "Открывай подарочные кейсы, пробуй игровые режимы, улучшай коллекцию и поднимайся в рейтинге.",
  "",
  "Сейчас доступен демонстрационный режим без ставок и реальных денег.",
].join("\n");

export function createTelegramBot(): Bot {
  const bot = new Bot(getBotToken());
  const miniAppUrl = getMiniAppUrl();

  bot.command("start", async (ctx) => {
    await ctx.reply(welcomeMessage, {
      reply_markup: new InlineKeyboard().webApp(
        "🎮 Открыть игру",
        miniAppUrl,
      ),
    });
  });

  return bot;
}