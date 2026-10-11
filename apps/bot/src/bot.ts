// grammY wiring. Every reply is built by render.ts from packages/guidance; this file only routes taps.
// Files and photos are never downloaded: the reply uses Telegram's metadata (name, mime) only.

import { Bot, InlineKeyboard } from "grammy";
import { PLATFORMS, SITUATIONS, URGENT_SAFETY, type Platform, type SafetyAnswer, type SituationId, SAFETY_ANSWERS, CATEGORIES, type Category, ITEMS, questionFor } from "@safechilds/guidance";
import type { Env } from "./env";
import { fileReply, hiddenLink, linkReply, NO_COVERAGE, pick, planMessage, platformMessage, questionMessage, safetyMessage, situationsMessage, startMessage, stopMessage, t, urgentMessage, UI, type Message } from "./render";
import { getState, reset, startIncident, type Locale } from "./state";
import { makeApi } from "./trpc";

function keyboard(m: Message) {
  const kb = new InlineKeyboard();
  for (const row of m.buttons) {
    for (const b of row) {
      if (b.url) kb.url(b.text, b.url);
      else if (b.data) kb.text(b.text, b.data);
    }
    kb.row();
  }
  return kb;
}

export function createBot(env: Env) {
  const bot = new Bot(env.BOT_TOKEN);
  const api = makeApi(env.API_URL);

  const send = (ctx: { reply: (text: string, other?: object) => Promise<unknown> }, m: Message) => ctx.reply(m.text, { reply_markup: keyboard(m) });

  bot.command("start", async (ctx) => {
    reset(ctx.chat.id);
    const kb = new InlineKeyboard().text("Тоҷикӣ", "lang:tg").text("Русский", "lang:ru");
    await ctx.reply(UI["pickLang"]!.ru, { reply_markup: kb });
  });

  bot.callbackQuery(/^lang:(ru|tg)$/, async (ctx) => {
    const s = getState(ctx.chat!.id);
    s.locale = ctx.match[1] as Locale;
    await ctx.answerCallbackQuery();
    await send(ctx, startMessage(s.locale, ctx.me.username));
  });

  bot.callbackQuery(/^cat:(.+)$/, async (ctx) => {
    const s = getState(ctx.chat!.id);
    const c = ctx.match[1] as Category;
    await ctx.answerCallbackQuery();
    if (!(CATEGORIES as readonly string[]).includes(c)) return send(ctx, startMessage(s.locale));
    await send(ctx, situationsMessage(c, s.locale));
  });

  bot.callbackQuery(/^sit:(.+)$/, async (ctx) => {
    const s = getState(ctx.chat!.id);
    const sit = ctx.match[1] as SituationId;
    await ctx.answerCallbackQuery();
    if (!(SITUATIONS as readonly string[]).includes(sit)) return send(ctx, startMessage(s.locale));
    startIncident(ctx.chat!.id, sit);
    await send(ctx, safetyMessage(s.locale));
  });

  bot.callbackQuery(/^safe:(.+)$/, async (ctx) => {
    const s = getState(ctx.chat!.id);
    const a = ctx.match[1] as SafetyAnswer;
    await ctx.answerCallbackQuery();
    if (!s.profile || !(SAFETY_ANSWERS as readonly string[]).includes(a)) return send(ctx, startMessage(s.locale));
    s.profile.safety = a;
    if (a === "threatened") s.profile.flags.threatened = true;
    if (URGENT_SAFETY.has(a)) return send(ctx, urgentMessage(s.profile, s.locale, env.APP_URL));
    const q = questionMessage(s.profile, s.locale);
    if (q) return send(ctx, q);
    const stop = stopMessage(s.profile, s.locale);
    if (stop) return send(ctx, stop);
    await send(ctx, platformMessage(s.locale));
  });

  bot.callbackQuery(/^ans:([^:]+):([^:]+)$/, async (ctx) => {
    const s = getState(ctx.chat!.id);
    await ctx.answerCallbackQuery();
    if (!s.profile) return send(ctx, startMessage(s.locale));
    const q = questionFor(ITEMS, s.profile);
    const answer = q && q.id === ctx.match[1] ? q.answers.find((x) => x.id === ctx.match[2]) : undefined;
    if (!answer) return send(ctx, startMessage(s.locale));
    if (answer.sets) s.profile.flags = { ...s.profile.flags, ...answer.sets };
    if (answer.next === "link") return send(ctx, { text: t("sendLink", s.locale), buttons: [] });
    const stop = stopMessage(s.profile, s.locale);
    if (stop) return send(ctx, stop);
    await send(ctx, platformMessage(s.locale));
  });

  bot.callbackQuery("plan", async (ctx) => {
    const s = getState(ctx.chat!.id);
    await ctx.answerCallbackQuery();
    if (!s.profile) return send(ctx, startMessage(s.locale));
    await send(ctx, s.profile.platform ? planMessage(s.profile, s.locale, env.APP_URL) : platformMessage(s.locale));
  });

  bot.callbackQuery(/^plat:(.+)$/, async (ctx) => {
    const s = getState(ctx.chat!.id);
    const p = ctx.match[1] as Platform;
    await ctx.answerCallbackQuery();
    if (!s.profile || !(PLATFORMS as readonly string[]).includes(p)) return send(ctx, startMessage(s.locale));
    s.profile.platform = p;
    await send(ctx, planMessage(s.profile, s.locale, env.APP_URL));
  });

  bot.callbackQuery("people", async (ctx) => {
    const s = getState(ctx.chat!.id);
    await ctx.answerCallbackQuery();
    try {
      const { items } = await api.directory.list.query({ lang: s.locale, limit: 3 });
      for (const p of items) {
        const lines = [p.isDemo ? t("demo", s.locale) : "", pick(p.name, s.locale), p.city ? pick(p.city, s.locale) : "", pick(p.contactMethod, s.locale)].filter(Boolean);
        await ctx.reply(lines.join("\n"));
      }
      if (items.length === 0) await ctx.reply(t("numbersPending", s.locale));
    } catch {
      await ctx.reply(t("numbersPending", s.locale));
    }
  });

  bot.callbackQuery("link", async (ctx) => {
    const s = getState(ctx.chat!.id);
    await ctx.answerCallbackQuery();
    await ctx.reply(t("sendLink", s.locale));
  });

  bot.callbackQuery("restart", async (ctx) => {
    const s = getState(ctx.chat!.id);
    await ctx.answerCallbackQuery();
    s.profile = null;
    await send(ctx, startMessage(s.locale));
  });

  // A pasted or forwarded link → links.check. The bot never opens it. A text_link (visible text ≠ real address) is
  // checked by its real address and called out; the reply never contains a tappable link.
  bot.on(["message:entities:url", "message:entities:text_link"], async (ctx) => {
    const s = getState(ctx.chat.id);
    const e = ctx.entities(["url", "text_link"])[0];
    if (!e) return;
    const raw = e.type === "text_link" ? e.url : e.text;
    const url = raw.startsWith("http") ? raw : `https://${raw}`;
    const hidden = hiddenLink(e);
    try {
      const r = await api.links.check.mutate({ url });
      await ctx.reply(linkReply(r, hidden, s.locale, url));
    } catch {
      await ctx.reply(linkReply({ tier: "unavailable", finalUrl: null, ...NO_COVERAGE }, hidden, s.locale, url));
    }
  });

  // Files: judged by Telegram's metadata only, never downloaded. Photos and videos: one sentence + the app.
  bot.on("message:document", async (ctx) => {
    const s = getState(ctx.chat.id);
    const d = ctx.message.document;
    await ctx.reply(fileReply(d.file_name, d.mime_type, s.locale));
  });
  bot.on(["message:photo", "message:video", "message:voice", "message:video_note"], async (ctx) => {
    const s = getState(ctx.chat.id);
    await ctx.reply(t("noFiles", s.locale), { reply_markup: new InlineKeyboard().url(t("checkImage", s.locale), `${env.APP_URL}/?from=bot`) });
  });

  // Free text: never interpreted. Re-show the start buttons.
  bot.on("message:text", async (ctx) => {
    const s = getState(ctx.chat.id);
    await send(ctx, startMessage(s.locale));
  });

  bot.catch((err) => {
    // No chat content in logs: the error name and the update type only.
    console.error("bot error", err.name, err.ctx.update.update_id);
  });

  return bot;
}
