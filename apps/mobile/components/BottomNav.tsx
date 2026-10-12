"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Icon } from "./Icon";

// Hidden on the screens where a nav would be a distraction or an escape hatch (DESIGN.md).
const HIDDEN = ["/welcome", "/safety", "/urgent", "/stop", "/breathe"];

// A floating pill with three tabs, full width: Главная · Поддержка · Мой случай. The round "Опиши своими словами" button
// beside it was removed 2026-10-12 evening (Ali): the chat door is the "Не знаю, что произошло" row on Home (plan 0005).
// "Профиль" became "Мой случай": there is no profile, only the one case and its settings.
export function BottomNav() {
  const t = useTranslations("nav");
  const path = usePathname();
  if (HIDDEN.some((p) => path === p || path.startsWith(p + "/"))) return null;
  const items = [
    { href: "/", icon: "house", label: t("home") },
    { href: "/feelings", icon: "life-buoy", label: t("support") },
    { href: "/incident", icon: "notepad-text", label: t("case") },
  ];
  return (
    <nav className="nav" aria-label={t("label")}>
      {items.map((it) => (
        <Link key={it.href} href={it.href} aria-current={path === it.href ? "page" : undefined}>
          <Icon name={it.icon} />
          <span>{it.label}</span>
        </Link>
      ))}
    </nav>
  );
}
