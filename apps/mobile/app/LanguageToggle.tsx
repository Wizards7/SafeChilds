"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocale } from "../lib/set-locale";
import type { Locale } from "../lib/locale";

// `long` shows the language names themselves (the welcome screen); the default short form fits the top bar.
export function LanguageToggle({ current, long = false }: { current: Locale; long?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const choose = (l: Locale) => {
    if (l === current) return;
    startTransition(async () => {
      await setLocale(l);
      router.refresh();
    });
  };
  return (
    <div className="lang" role="group" aria-label="Language">
      <button aria-pressed={current === "tg"} disabled={pending} onClick={() => choose("tg")}>{long ? "Тоҷикӣ" : "TJ"}</button>
      <button aria-pressed={current === "ru"} disabled={pending} onClick={() => choose("ru")}>{long ? "Русский" : "RU"}</button>
    </div>
  );
}
