// Learn-the-signs cards: the organizers' "что это · как это выглядит · почему ребёнок молчит" for each category.
// Not profile-driven and never part of a plan, so they are indexed by category instead of carrying a showWhen.
// A mock line may contain marker tokens [1]..[9]; the renderer shows them as numbered badges on reveal, and
// signs[n - 1] is the explanation for marker n. The bot can render the same cards as plain numbered text.

import type { Text } from "./items";
import type { Category } from "./profile";

export type SignCategory = Exclude<Category, "unknown">;
export const SIGN_CATEGORIES: readonly SignCategory[] = ["fake_content", "extortion", "fraud", "cyberbullying"];

export type MockKind = "chat" | "profile" | "post" | "notice" | "link" | "photo";

export interface MockLine {
  who?: "me" | "meta"; // default: the other side. "me" = the kid's own message, "meta" = a header, attachment or counter line
  text: Text;
}

export interface SignCard {
  id: string;
  title: Text; // the sign in one line
  mock: { kind: MockKind; lines: MockLine[] }; // "photo" draws a fixed scene: lines are empty, markers 1..4 sit on the drawing
  signs: Text[]; // explanation per marker number
}

export interface CategoryAbout {
  what: Text; // "что это", two or three sentences
  silent: { thought: Text; answer: Text }[]; // "почему ребёнок молчит": the thought and the one-line answer
}

const MARKER = /\[(\d)\]/g;

// "Привет [1], это ты?" → ["Привет ", 1, ", это ты?"]
export function splitMarkers(text: string): (string | number)[] {
  const out: (string | number)[] = [];
  let last = 0;
  for (const m of text.matchAll(MARKER)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(Number(m[1]));
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function markerNumbers(text: string): number[] {
  return [...text.matchAll(MARKER)].map((m) => Number(m[1]));
}

// Markers of one card in one language, sorted and de-duplicated. Photo cards place their markers by position.
export function cardMarkers(card: SignCard, locale: "ru" | "tg"): number[] {
  if (card.mock.kind === "photo") return card.signs.map((_, i) => i + 1);
  const all = card.mock.lines.flatMap((l) => markerNumbers(l.text[locale]));
  return [...new Set(all)].sort((a, b) => a - b);
}
