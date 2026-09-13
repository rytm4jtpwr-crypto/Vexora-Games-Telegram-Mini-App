import { Bot, InlineKeyboard } from "grammy";
import { getBotToken, getMiniAppUrl } from "./config";

const welcomeMessage = [
  "Добро пожаловать в Vexora Games.",
  "",
  "Это игровая платформа в Telegram. Здесь будет собираться коллекция мини-игр, бонусов и рейтингов.",
  "",
  "Первый этап — только демо-интерфейс. Азартные игры, платежи, криптовалюта и вывод средств пока не используются.",
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