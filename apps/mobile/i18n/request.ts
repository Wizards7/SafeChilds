// next-intl without URL locale prefixes: the locale lives on the device (a non-sensitive cookie set by the toggle).
// Routes stay /, /safety, /plan … in both languages.
// No cookie yet (first open): the phone's own language decides. A Tajik system language opens in Tajik, anything
// else in Russian; the toggle on the first welcome screen is the one-tap override (plan 0001 § languages, 2026-10-12).

import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { isLocale, LOCALE_COOKIE, type Locale } from "../lib/locale";

function fromAcceptLanguage(header: string | null): Locale {
  const first = (header ?? "").split(",")[0]?.trim().toLowerCase() ?? "";
  return first === "tg" || first.startsWith("tg-") ? "tg" : "ru";
}

export default getRequestConfig(async () => {
  const raw = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale: Locale = isLocale(raw)
    ? raw
    : fromAcceptLanguage((await headers()).get("accept-language"));
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
