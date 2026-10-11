// What was checked and what was not: the line under every result. Derived from the signals, never written by hand
// per screen, so the app and the bot cannot drift apart. "Не проверено" is where honesty lives: a green-looking
// result with half the checks missing must say so (plan 0003).

import type { Evidence } from "./evidence";
import type { Decision } from "./rules";
import type { Text } from "./templates";

export interface Coverage<C extends string> {
  checked: C[];
  unchecked: C[];
}

// Image: four checks on the phone and one on the server. "c2pa_signature" only exists when a manifest was found.
export const IMAGE_CHECKS = ["metadata", "c2pa", "c2pa_signature", "original", "model"] as const;
export type ImageCheck = (typeof IMAGE_CHECKS)[number];

export function imageCoverage(d: Pick<Decision, "evidence"> & { model?: Decision["model"] }): Coverage<ImageCheck> {
  const ev = new Set<Evidence>(d.evidence);
  const has = (...codes: Evidence[]) => codes.some((c) => ev.has(c));
  const checked: ImageCheck[] = [];
  const unchecked: ImageCheck[] = [];
  (has("exif_present", "exif_stripped", "exif_contradiction") ? checked : unchecked).push("metadata");
  (has("c2pa_absent", "c2pa_present_unverified", "c2pa_declares_generated", "c2pa_declares_edited") ? checked : unchecked).push("c2pa");
  if (has("c2pa_declares_generated", "c2pa_declares_edited")) checked.push("c2pa_signature");
  else if (has("c2pa_present_unverified")) unchecked.push("c2pa_signature");
  (has("original_differs", "original_matches") ? checked : unchecked).push("original");
  (d.model === "ok" ? checked : unchecked).push("model");
  return { checked, unchecked };
}

// Link: three sources the backend runs today and one it does not have yet (blocklists, VERIFY in plan 0001).
export const LINK_SOURCES = ["destination", "lookalike", "age", "blocklists"] as const;
export type LinkSource = (typeof LINK_SOURCES)[number];

export const COVERAGE_LABEL: Record<"checked" | "unchecked", Text> = {
  checked: { ru: "Проверено", tg: "Санҷида шуд", verify: true },
  unchecked: { ru: "Не проверено", tg: "Санҷида нашуд", verify: true },
};

export const IMAGE_CHECK_TEXT: Record<ImageCheck, Text> = {
  metadata: { ru: "метаданные файла", tg: "метамаълумоти файл", verify: true },
  c2pa: { ru: "отметка Content Credentials", tg: "нишонаи Content Credentials", verify: true },
  c2pa_signature: { ru: "подпись Content Credentials", tg: "имзои Content Credentials", verify: true },
  original: { ru: "сравнение с твоим оригиналом", tg: "муқоиса бо аслии ту", verify: true },
  model: { ru: "признаки на изображении", tg: "нишонаҳо дар тасвир", verify: true },
};

export const LINK_SOURCE_TEXT: Record<LinkSource, Text> = {
  destination: { ru: "куда ведёт ссылка", tg: "пайванд ба куҷо мебарад", verify: true },
  lookalike: { ru: "похожесть на известные сайты", tg: "монандӣ ба сомонаҳои маълум", verify: true },
  age: { ru: "возраст домена", tg: "синну соли домен", verify: true },
  blocklists: { ru: "списки опасных сайтов", tg: "рӯйхатҳои сомонаҳои хатарнок", verify: true },
};

// "Проверено: a, b. Не проверено: c." A half with nothing in it is left out.
export function coverageLine<C extends string>(c: Coverage<C>, text: Record<C, Text>, locale: "ru" | "tg"): string {
  const half = (label: Text, items: C[]) => (items.length ? `${label[locale]}: ${items.map((i) => text[i][locale]).join(", ")}.` : "");
  return [half(COVERAGE_LABEL.checked, c.checked), half(COVERAGE_LABEL.unchecked, c.unchecked)].filter(Boolean).join(" ");
}
