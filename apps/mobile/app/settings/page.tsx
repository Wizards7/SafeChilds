"use client";

// Настройки (2026-10-12 night): behind the gear in the "Мой случай" header. Language and the privacy page, nothing
// else: no account, no theme (light only, plan 0001).

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Icon } from "../../components/Icon";
import { TopBar } from "../../components/TopBar";
import { LanguageToggle } from "../LanguageToggle";
import type { Locale } from "../../lib/locale";
import "./settings.css";

export default function SettingsPage() {
  const locale = useLocale() as Locale;
  const t = useTranslations("settings");
  return (
    <>
      <TopBar title={t("title")} backHref="/incident" />
      <main>
        <div className="settings">
          <div className="row"><span className="t">{t("language")}</span><LanguageToggle current={locale} long /></div>
          <Link className="row" href="/privacy"><span className="t">{t("privacy")}</span><Icon name="chevron-right" className="i chev" /></Link>
        </div>
      </main>
    </>
  );
}
