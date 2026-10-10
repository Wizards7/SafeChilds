export const LOCALES = ["ru", "tg"] as const;
export type Locale = (typeof LOCALES)[number];
export const LOCALE_COOKIE = "sc-lang";

export function isLocale(v: unknown): v is Locale {
  return v === "ru" || v === "tg";
}

// Guidance content carries both languages in one object; pick the one for this locale.
export function pick(text: { ru: string; tg: string }, locale: Locale): string {
  return text[locale];
}
