// Category: не знаю, что произошло. Four steps that hold for any situation, so this door never ends on an empty plan
// (2026-10-13). The text is the reviewed text of the category steps, the same objects, so a Tajik correction lands in
// both places; only the evidence line is new, because each category's names its own things.

import type { Item, StepItem, Text } from "../items";
import { ADULT_MESSAGE } from "./common";
import { CYBERBULLYING } from "./cyberbullying";
import { FAKE_CONTENT } from "./fake_content";
import { FRAUD } from "./fraud";

function step(items: readonly Item[], id: string): StepItem {
  const s = items.find((i): i is StepItem => i.kind === "step" && i.id === id);
  if (!s) throw new Error(`guidance: step ${id} not found`);
  return s;
}
function text(s: StepItem, field: "how" | "why"): Text {
  const t = s[field];
  if (!t) throw new Error(`guidance: step ${s.id} has no ${field}`);
  return t;
}

const cat = { category: "unknown" } as const;
const dontSend = step(FRAUD, "fraud.dont_send");
const save = step(FRAUD, "fraud.save");
const saveAll = step(CYBERBULLYING, "cb.save");
const dontReply = step(FAKE_CONTENT, "fake.dont_reply");
const tellAdult = step(FAKE_CONTENT, "fake.tell_adult");

export const UNKNOWN: readonly Item[] = [
  { kind: "step", id: "unknown.dont_send", showWhen: cat, order: 10, title: dontSend.title, how: text(dontSend, "how") },
  {
    kind: "step",
    id: "unknown.save",
    showWhen: cat,
    order: 20,
    title: save.title,
    how: { ru: "Скриншоты сообщений, постов и профиля, ссылки, имена аккаунтов, даты. Ничего не удаляй. Хранится только на твоём телефоне.", tg: "Скриншоти паёмҳо, постҳо ва профил, пайвандҳо, номи ҳисобҳо, санаҳо. Ҳеҷ чизро нест накун. Танҳо дар телефони ту нигоҳ дошта мешавад.", verify: true },
    why: text(saveAll, "why"),
  },
  { kind: "step", id: "unknown.dont_reply", showWhen: cat, order: 30, title: dontReply.title, why: text(dontReply, "why") },
  { kind: "step", id: "unknown.tell_adult", showWhen: cat, order: 40, title: tellAdult.title, how: text(tellAdult, "how"), message: ADULT_MESSAGE.unknown },
];
