"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { LanguageToggle } from "../app/LanguageToggle";
import type { Locale } from "../lib/locale";
import { Icon } from "./Icon";

export function TopBar({ title, back = true, backHref, right }: { title?: ReactNode; back?: boolean; backHref?: string | undefined; right?: ReactNode }) {
  const t = useTranslations("common");
  const router = useRouter();
  const locale = useLocale() as Locale;
  return (
    <header className="top">
      {back ? (
        <button className="back" aria-label={t("back")} onClick={() => (backHref ? router.push(backHref) : router.back())}>
          <Icon name="arrow-left" />
        </button>
      ) : (
        <span className="brand">SafeChilds</span>
      )}
      <span className="title">{title}</span>
      {right ?? <LanguageToggle current={locale} />}
    </header>
  );
}
