// next-intl without URL locale prefixes: the locale lives on the device (a non-sensitive cookie set on /welcome).
// Routes stay /, /safety, /plan … in both languages.

import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { isLocale, LOCALE_COOKIE, type Locale } from "../lib/locale";

export default getRequestConfig(async () => {
  const raw = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale: Locale = isLocale(raw) ? raw : "ru";
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
