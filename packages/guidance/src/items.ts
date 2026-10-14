// Item kinds. Every item carries a showWhen, an order, and strings in both languages.

import { PLATFORMS, type Category, type Flag, type Platform, type Profile } from "./profile";
import type { ShowWhen } from "./showWhen";
import { matches } from "./showWhen";

export type Locale = "ru" | "tg";
// Tajik strings written by AI carry `verify: true` until a native speaker reviewed them.
export interface Text {
  ru: string;
  tg: string;
  verify?: boolean;
}

export interface StepItem {
  kind: "step";
  id: string;
  showWhen: ShowWhen;
  order: number;
  title: Text;
  how?: Text; // the exact taps, may depend on platform (then one item per platform with showWhen)
  why?: Text;
  message?: Text; // a ready message to copy or share, when the step is "tell an adult"
  verifyOnDay?: boolean; // report paths change; the floater re-checks on the demo day
}

export interface QuestionItem {
  kind: "question";
  id: string;
  showWhen: ShowWhen;
  text: Text;
  hint?: Text;
  answers: { id: string; label: Text; sets?: Partial<Record<Flag, boolean>>; next?: "analyze" | "link" | "stop" | "plan" }[];
}

export interface StopItem {
  kind: "stop";
  id: string;
  showWhen: ShowWhen;
  title: Text;
  lines: Text[];
  note: Text;
}

export interface UrgentLineItem {
  kind: "urgent";
  id: string;
  showWhen: ShowWhen;
  text: Text;
}

export type Item = StepItem | QuestionItem | StopItem | UrgentLineItem;

export interface Plan {
  now: StepItem[];
  later: StepItem[];
}

// The "three now" rule: the first three matching steps are "сейчас", the rest "потом";
// with four or fewer matching steps, all are shown.
export function composePlan(items: readonly Item[], profile: Profile): Plan {
  const steps = items
    .filter((i): i is StepItem => i.kind === "step" && matches(i.showWhen, profile))
    .sort((a, b) => a.order - b.order);
  if (steps.length <= 4) return { now: steps, later: [] };
  return { now: steps.slice(0, 3), later: steps.slice(3) };
}

// The platform picker on the plan shows only when picking a platform changes the plan: a report path, restrict vs block
// (2026-10-14). Extortion and «Не знаю» have no platform step, so a picker there would change nothing.
export function platformMatters(items: readonly Item[], profile: Profile): boolean {
  const ids = (p: Profile) => {
    const plan = composePlan(items, p);
    return [...plan.now, ...plan.later].map((s) => s.id).join(" ");
  };
  const none = ids({ ...profile, platform: null });
  return PLATFORMS.some((platform) => ids({ ...profile, platform }) !== none);
}

export function questionFor(items: readonly Item[], profile: Profile): QuestionItem | null {
  return items.find((i): i is QuestionItem => i.kind === "question" && matches(i.showWhen, profile)) ?? null;
}

export function stopCardFor(items: readonly Item[], profile: Profile): StopItem | null {
  return items.find((i): i is StopItem => i.kind === "stop" && matches(i.showWhen, profile)) ?? null;
}

export function urgentLinesFor(items: readonly Item[], profile: Profile): UrgentLineItem[] {
  return items.filter((i): i is UrgentLineItem => i.kind === "urgent" && matches(i.showWhen, profile));
}

export const PLATFORM_LABEL: Record<Platform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  telegram: "Telegram",
  vk: "VK",
};

export const CATEGORY_LABEL: Record<Category, Text> = {
  fake_content: { ru: "Поддельный контент", tg: "Мазмуни қалбакӣ", verify: true },
  extortion: { ru: "Вымогательство", tg: "Шантаж", verify: true },
  fraud: { ru: "Мошенничество", tg: "Қаллобӣ", verify: true },
  cyberbullying: { ru: "Травля", tg: "Таҳқир", verify: true },
  unknown: { ru: "Не знаю, что произошло", tg: "Намедонам, чӣ шуд", verify: true },
};
