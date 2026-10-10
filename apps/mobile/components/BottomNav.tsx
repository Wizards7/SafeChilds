"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Icon } from "./Icon";

// Hidden on the screens where a nav would be a distraction or an escape hatch (DESIGN.md).
const HIDDEN = ["/welcome", "/safety", "/urgent", "/stop", "/breathe"];

export function BottomNav() {
  const t = useTranslations("nav");
  const path = usePathname();
  if (HIDDEN.some((p) => path === p || path.startsWith(p + "/"))) return null;
  const items = [
    { href: "/", icon: "house", label: t("home") },
    { href: "/incident", icon: "folder", label: t("incident") },
    { href: "/feelings", icon: "heart", label: t("support") },
    { href: "/people", icon: "users", label: t("people") },
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
