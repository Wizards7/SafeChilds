"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Icon } from "./Icon";

// The permanent way to /urgent: a small red shield in every header (plan 0001 § 5 — reachable from every screen in one
// tap). Replaces the always-on floating pill, which now shows once per open and leaves (HelpButton). Hidden on /urgent.
export function UrgentLink() {
  const t = useTranslations("help");
  const path = usePathname();
  if (path === "/urgent" || path === "/welcome") return null;
  return (
    <Link className="urgent" href="/urgent" aria-label={t("button")}>
      <Icon name="shield-alert" />
    </Link>
  );
}
