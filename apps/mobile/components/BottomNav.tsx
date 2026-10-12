"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Icon } from "./Icon";

// Hidden on the screens where a nav would be a distraction or an escape hatch (DESIGN.md).
const HIDDEN = ["/welcome", "/safety", "/urgent", "/stop", "/breathe"];

// A floating pill with three tabs, and a separate round button for "Опиши своими словами" (plan 0005: a door into
// the plan, not a section of the app, so it is an action beside the bar, not a tab in it).
export function BottomNav() {
  const t = useTranslations("nav");
  const path = usePathname();
  if (HIDDEN.some((p) => path === p || path.startsWith(p + "/"))) return null;
  const items = [
    { href: "/", icon: "house", label: t("home") },
    { href: "/feelings", icon: "life-buoy", label: t("support") },
    { href: "/incident", icon: "user", label: t("profile") },
  ];
  return (
    <>
      <nav className="nav" aria-label={t("label")}>
        {items.map((it) => (
          <Link key={it.href} href={it.href} aria-current={path === it.href ? "page" : undefined}>
            <Icon name={it.icon} />
            <span>{it.label}</span>
          </Link>
        ))}
      </nav>
      {path !== "/chat" && (
        <Link className="nav-chat" href="/chat" aria-label={t("chat")}>
          <Icon name="message-circle" />
        </Link>
      )}
    </>
  );
}
