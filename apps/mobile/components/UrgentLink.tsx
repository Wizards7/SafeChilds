"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Icon } from "./Icon";

// The way to /urgent on every screen (plan 0001 § 5): a red pill with the word in every header, hidden on /urgent itself.
// Replaced the floating pill (2026-10-12, Ali's Home mockup).
export function UrgentLink() {
  const t = useTranslations("help");
  const path = usePathname();
  if (path === "/urgent" || path === "/welcome") return null;
  return (
    <Link className="urgent" href="/urgent" aria-label={t("button")}>
      <Icon name="shield-alert" size={18} />
      <span>{t("short")}</span>
    </Link>
  );
}
