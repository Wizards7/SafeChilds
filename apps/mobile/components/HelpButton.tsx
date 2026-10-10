"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Icon } from "./Icon";

// The floating help button: every screen, one tap to /urgent. The only element that ignores the situation profile.
export function HelpButton() {
  const t = useTranslations("help");
  const path = usePathname();
  if (path === "/urgent" || path === "/welcome") return null;
  return (
    <Link className="help" href="/urgent">
      <Icon name="shield-alert" size={20} />
      <span>{t("button")}</span>
    </Link>
  );
}
