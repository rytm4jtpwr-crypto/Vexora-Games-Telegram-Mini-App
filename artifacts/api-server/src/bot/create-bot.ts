import { Bot, InlineKeyboard } from "grammy";
import { getBotToken, getMiniAppUrl } from "./config";

const welcomeMessage = [
  "Добро пожаловать в Vexora Games.",
  "",
  "Telegram Gifts в новом игровом формате.",
  "",
  "Открывай кейсы, запускай Rocket, Mines и Roulette. Собирай редкие NFT-подарки, улучшай коллекцию и поднимайся в рейтинге.",
  "",
  "Новые подарки и игровые режимы будут появляться постепенно.",
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