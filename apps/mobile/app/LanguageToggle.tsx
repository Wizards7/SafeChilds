"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocale } from "../lib/set-locale";
import type { Locale } from "../lib/locale";

export function LanguageToggle({ current }: { current: Locale }) {
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
      <button aria-pressed={current === "tg"} disabled={pending} onClick={() => choose("tg")}>TJ</button>
      <button aria-pressed={current === "ru"} disabled={pending} onClick={() => choose("ru")}>RU</button>
    </div>
  );
}
