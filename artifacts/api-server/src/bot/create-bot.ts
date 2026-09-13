import { Bot, InlineKeyboard } from "grammy";
import { getBotToken, getMiniAppUrl } from "./config";

const welcomeMessage = [
  "Добро пожаловать в Vexora Games.",
  "",
  "Здесь коллекционные Telegram-подарки становятся частью игры.",
  "",
  "Открывай кейсы, запускай Rocket, исследуй Mines и Roulette, собирай редкие подарки и развивай свою коллекцию.",
  "",
  "Vexora Games развивается — новые подарки, механики и игровые режимы будут появляться постепенно.",
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