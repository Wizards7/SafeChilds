// Pure message builders: the same guidance items the app renders, as Telegram text + inline keyboards.
// No network, no state — unit-tested. Every string comes from packages/guidance or the small UI table below.

import {
  ADULT_MESSAGE,
  CATEGORIES,
  CATEGORY_LABEL,
  composePlan,
  FEELINGS_HINT,
  ITEMS,
  NOT_YOUR_FAULT,
  PLATFORM_LABEL,
  PLATFORMS,
  questionFor,
  SAFETY_ANSWERS,
  SAFETY_HINT,
  SAFETY_LABEL,
  SAFETY_QUESTION,
  SITUATION_CATEGORY,
  SITUATION_LABEL,
  SITUATIONS,
  stopCardFor,
  urgentLinesFor,
  type Category,
  type Profile,
  type Text,
} from "@safechilds/guidance";
import { LINK_TIER_TEXT, type LinkTier } from "@safechilds/analysis";
import type { Locale } from "./state";

export const UI: Record<string, Text> = {
  start: { ru: "Что-то случилось в интернете?", tg: "Дар интернет чизе рӯй дод?", verify: true },
  pickLang: { ru: "Выбери язык · Забонро интихоб кун", tg: "Выбери язык · Забонро интихоб кун" },
  whatHappened: { ru: "Что случилось?", tg: "Чӣ рӯй дод?", verify: true },
  whatExactly: { ru: "Что именно случилось?", tg: "Маҳз чӣ рӯй дод?", verify: true },
  where: { ru: "Где это произошло?", tg: "Ин дар куҷо рӯй дод?", verify: true },
  now: { ru: "Сейчас", tg: "Ҳозир", verify: true },
  later: { ru: "Потом", tg: "Баъд", verify: true },
  how: { ru: "Как", tg: "Чӣ тавр", verify: true },
  why: { ru: "Почему", tg: "Чаро", verify: true },
  urgentTitle: { ru: "Сейчас главное — безопасность.", tg: "Ҳоло муҳимтаринаш амният аст.", verify: true },
  tellAdult: { ru: "Расскажи взрослому прямо сейчас. Не обязательно родителям — тому, кому доверяешь. Можно переслать это сообщение:", tg: "Ҳозир ба калонсол бигӯ. Ҳатман ба волидайн не — ба касе, ки бовар дорӣ. Ин паёмро фиристодан мумкин:", verify: true },
  numbersPending: { ru: "Номера служб помощи появятся здесь после проверки командой.", tg: "Рақамҳои хадамоти кӯмак пас аз санҷиши даста ин ҷо пайдо мешаванд.", verify: true },
  talkToPerson: { ru: "Поговорить с человеком", tg: "Бо одам сӯҳбат кардан", verify: true },
  checkImage: { ru: "Проверить изображение (в приложении)", tg: "Тасвирро санҷидан (дар барнома)", verify: true },
  checkLink: { ru: "Проверить ссылку", tg: "Пайвандро санҷидан", verify: true },
  myCase: { ru: "Мой случай (в приложении)", tg: "Ҳолати ман (дар барнома)", verify: true },
  restart: { ru: "Начать заново", tg: "Аз нав оғоз", verify: true },
  more: { ru: "Ещё", tg: "Боз", verify: true },
  demo: { ru: "ДЕМО — вымышленная карточка", tg: "ДЕМО — корти тахайюлӣ", verify: true },
  noFiles: { ru: "Здесь мы не смотрим файлы и фото. Проверить изображение можно в приложении — оно удаляется сразу после проверки.", tg: "Ин ҷо мо файлҳо ва аксҳоро намебинем. Тасвирро дар барнома санҷидан мумкин — он фавран пас аз санҷиш нест мешавад.", verify: true },
  apk: { ru: "Это установочный файл для Android. Никогда не устанавливай приложения из чата — только из Play Store. Поддельные «банковские» приложения — главный способ украсть деньги.", tg: "Ин файли насби Android аст. Ҳеҷ гоҳ барномаҳоро аз чат насб накун — танҳо аз Play Store. Барномаҳои қалбакии «бонкӣ» — роҳи асосии дуздии пул.", verify: true },
  exe: { ru: "Это программа. Не открывай — ни один сервис не присылает программы в чат.", tg: "Ин барнома аст. Накушо — ҳеҷ як хидмат барномаҳоро ба чат намефиристад.", verify: true },
  doc: { ru: "Мы не видим, что внутри. Опасность — в кнопках «включить содержимое / макросы» и ссылках внутри. Открывай только в режиме просмотра и не нажимай «включить».", tg: "Мо намебинем, ки дар дохил чист. Хатар — дар тугмаҳои «фаъол кардан / макросҳо» ва пайвандҳои дохил. Танҳо дар реҷаи дидан кушо ва «фаъол кардан»-ро пахш накун.", verify: true },
  archive: { ru: "Архив скрывает тип файла внутри. Не распаковывай из чата.", tg: "Архив намуди файли дохилро пинҳон мекунад. Аз чат накушо.", verify: true },
  otherFile: { ru: "Мы не проверяем файлы изнутри. Если файл обещает деньги или просит код — не открывай.", tg: "Мо файлҳоро аз дохил намесанҷем. Агар файл пул ваъда диҳад ё рамз пурсад — накушо.", verify: true },
  sendLink: { ru: "Пришли ссылку одним сообщением — проверим, куда она ведёт. Открывать её тебе не нужно.", tg: "Пайвандро бо як паём фирист — месанҷем, ба куҷо мебарад. Ба ту кушодан лозим нест.", verify: true },
  useButtons: { ru: "Нажми одну из кнопок выше.", tg: "Яке аз тугмаҳои болоро пахш кун.", verify: true },
  neverAsk: { ru: "Мы никогда не просим коды, пароли или деньги. Настоящий бот — только @{username}.", tg: "Мо ҳеҷ гоҳ рамз, парол ё пул намепурсем. Боти аслӣ — танҳо @{username}.", verify: true },
  leadsTo: { ru: "Ведёт на", tg: "Мебарад ба", verify: true },
  hiddenLink: { ru: "Внимание: текст ссылки показывает «{shown}», а ведёт на «{real}». Так прячут настоящий адрес.", tg: "Диққат: матни пайванд «{shown}»-ро нишон медиҳад, аммо ба «{real}» мебарад. Суроғаи аслиро ҳамин тавр пинҳон мекунанд.", verify: true },
  apkDisguised: { ru: "Файл называется как фото, документ или приглашение, но это программа для Android (.apk). Так маскируют приложения, которые читают СМС с кодами. Не устанавливай. Настоящие приложения — только из Play Store.", tg: "Файл мисли акс, ҳуҷҷат ё даъватнома ном дорад, аммо ин барномаи Android аст (.apk). Барномаҳоеро, ки СМС-и рамздорро мехонанд, ҳамин тавр пинҳон мекунанд. Насб накун. Барномаҳои аслӣ — танҳо аз Play Store.", verify: true },
};

export const t = (key: keyof typeof UI, locale: Locale) => UI[key]![locale];
export const pick = (text: Text, locale: Locale) => text[locale];

export interface Button {
  text: string;
  data?: string;
  url?: string;
}
export interface Message {
  text: string;
  buttons: Button[][];
}

// username: the bot's own @username, so a kid can tell the real bot from a copy that asks for codes.
export function startMessage(locale: Locale, username?: string): Message {
  const cats = CATEGORIES.filter((c): c is Exclude<Category, "unknown"> => c !== "unknown");
  const lines = [t("start", locale)];
  if (username) lines.push(t("neverAsk", locale).replace("{username}", username));
  lines.push("", t("whatHappened", locale));
  return {
    text: lines.join("\n"),
    buttons: [...cats.map((c) => [{ text: pick(CATEGORY_LABEL[c], locale), data: `cat:${c}` }]), [{ text: pick(CATEGORY_LABEL.unknown, locale), data: "sit:unknown" }]],
  };
}

export function situationsMessage(category: Category, locale: Locale): Message {
  const sits = SITUATIONS.filter((s) => SITUATION_CATEGORY[s] === category);
  return { text: t("whatExactly", locale), buttons: sits.map((s) => [{ text: pick(SITUATION_LABEL[s], locale), data: `sit:${s}` }]) };
}

export function safetyMessage(locale: Locale): Message {
  return {
    text: `${pick(SAFETY_QUESTION, locale)}\n${pick(SAFETY_HINT, locale)}`,
    buttons: SAFETY_ANSWERS.map((a) => [{ text: pick(SAFETY_LABEL[a], locale), data: `safe:${a}` }]),
  };
}

export function urgentMessage(profile: Profile, locale: Locale, appUrl: string): Message {
  const lines = urgentLinesFor(ITEMS, profile).map((l) => pick(l.text, locale));
  const message = pick(ADULT_MESSAGE[profile.category], locale);
  return {
    text: [t("urgentTitle", locale), pick(NOT_YOUR_FAULT, locale), ...lines, "", t("tellAdult", locale), `«${message}»`, "", t("numbersPending", locale)].join("\n"),
    buttons: [[{ text: t("talkToPerson", locale), data: "people" }], [{ text: t("myCase", locale), url: `${appUrl}/?from=bot` }], [{ text: t("restart", locale), data: "restart" }]],
  };
}

export function questionMessage(profile: Profile, locale: Locale): Message | null {
  const q = questionFor(ITEMS, profile);
  if (!q) return null;
  return {
    text: [pick(q.text, locale), q.hint ? pick(q.hint, locale) : ""].filter(Boolean).join("\n"),
    buttons: q.answers.map((a) => [{ text: pick(a.label, locale), data: `ans:${q.id}:${a.id}` }]),
  };
}

export function stopMessage(profile: Profile, locale: Locale): Message | null {
  const s = stopCardFor(ITEMS, profile);
  if (!s) return null;
  return {
    text: [pick(s.title, locale), ...s.lines.map((l) => `• ${pick(l, locale)}`), "", pick(s.note, locale)].join("\n"),
    buttons: [[{ text: t("where", locale), data: "plan" }]],
  };
}

export function platformMessage(locale: Locale): Message {
  return { text: t("where", locale), buttons: [PLATFORMS.map((p) => ({ text: PLATFORM_LABEL[p], data: `plat:${p}` }))] };
}

export function planMessage(profile: Profile, locale: Locale, appUrl: string): Message {
  const plan = composePlan(ITEMS, profile);
  const step = (s: (typeof plan.now)[number], i: number) => {
    const parts = [`${i}. ${pick(s.title, locale)}`];
    if (s.how) parts.push(`   ${t("how", locale)}: ${pick(s.how, locale)}`);
    if (s.why) parts.push(`   ${t("why", locale)}: ${pick(s.why, locale)}`);
    if (s.message) parts.push(`   «${pick(s.message, locale)}»`);
    return parts.join("\n");
  };
  const text = [
    `${t("now", locale)}:`,
    ...plan.now.map((s, i) => step(s, i + 1)),
    ...(plan.later.length ? ["", `${t("later", locale)}:`, ...plan.later.map((s, i) => step(s, plan.now.length + i + 1))] : []),
  ].join("\n");
  const buttons: Button[][] = [[{ text: t("talkToPerson", locale), data: "people" }]];
  if (profile.situation === "fake_photo" || profile.situation === "fake_video") buttons.push([{ text: t("checkImage", locale), url: `${appUrl}/?from=bot` }]);
  if (profile.category === "fraud") buttons.push([{ text: t("checkLink", locale), data: "link" }]);
  buttons.push([{ text: t("myCase", locale), url: `${appUrl}/?from=bot` }], [{ text: t("restart", locale), data: "restart" }]);
  return { text, buttons };
}

// Never a tappable link in a reply: the dot becomes "[.]" so Telegram does not auto-link it.
export function defang(host: string): string {
  return host.replace(/\./g, "[.]");
}

function hostOf(s: string): string | null {
  try {
    return new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(s) ? s : `https://${s}`).hostname.toLowerCase();
  } catch {
    return null;
  }
}

const LOOKS_LIKE_ADDRESS = /^(?:https?:\/\/)?[\w-]+(?:\.[\w-]+)+(?:[/?#]\S*)?$/i;

// A text_link whose visible text looks like an address but points somewhere else: the hidden link (plan 0003).
export function hiddenLink(entity: { type: string; text: string; url?: string }): { shown: string; real: string } | null {
  if (entity.type !== "text_link" || !entity.url) return null;
  const shown = entity.text.trim();
  if (!LOOKS_LIKE_ADDRESS.test(shown)) return null;
  const shownHost = hostOf(shown);
  const realHost = hostOf(entity.url);
  if (!shownHost || !realHost || shownHost === realHost) return null;
  return { shown: shownHost, real: realHost };
}

// The link verdict as text: the hidden-link warning first, then the tier, then the destination host, defanged.
// Only the host is shown: a full URL can carry a token or a name.
export function linkReply(result: { tier: LinkTier; finalUrl: string | null }, hidden: { shown: string; real: string } | null, locale: Locale): string {
  const head = LINK_TIER_TEXT[result.tier];
  const lines: string[] = [];
  if (hidden) lines.push(t("hiddenLink", locale).replace("{shown}", defang(hidden.shown)).replace("{real}", defang(hidden.real)), "");
  lines.push(pick(head.title, locale), pick(head.body, locale));
  const finalHost = result.finalUrl ? hostOf(result.finalUrl) : null;
  if (finalHost) lines.push(`${t("leadsTo", locale)}: ${defang(finalHost)}`);
  return lines.join("\n");
}

// VERIFY with native speakers: the words scammers use to make an installer look like a harmless file (plan 0003).
const DISGUISE_WORDS = ["фото", "видео", "документ", "приглашение", "свадьба", "посылка", "чек", "сурат", "ҳуҷҷат", "даъватнома", "тӯй", "туй", "photo", "video", "invite", "invitation", "document"];

export function fileReply(fileName: string | undefined, mime: string | undefined, locale: Locale): string {
  const name = (fileName ?? "").toLowerCase();
  const ext = name.includes(".") ? name.slice(name.lastIndexOf(".") + 1) : "";
  if (ext === "apk" || mime === "application/vnd.android.package-archive") return DISGUISE_WORDS.some((w) => name.includes(w)) ? t("apkDisguised", locale) : t("apk", locale);
  if (["exe", "scr", "bat", "msi", "cmd", "com"].includes(ext)) return t("exe", locale);
  if (["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext)) return t("doc", locale);
  if (["zip", "rar", "7z"].includes(ext)) return t("archive", locale);
  return t("otherFile", locale);
}

export { FEELINGS_HINT };
