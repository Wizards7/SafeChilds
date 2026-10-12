"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Icon } from "./Icon";

// The floating help pill: shown once per open, on the first screen, for three seconds, then it slides away for the rest
// of the session (Ali, 2026-10-12). The permanent path to /urgent is the red shield in every header (UrgentLink).
// Session storage holds only a "shown" flag, nothing about the kid.
const KEY = "sc-help-shown";
const SHOW_MS = 3000;
const LEAVE_MS = 250;

function alreadyShown(): boolean {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function HelpButton() {
  const t = useTranslations("help");
  const path = usePathname();
  const [phase, setPhase] = useState<"pending" | "shown" | "leaving" | "gone">("pending");

  // Runs per screen: the three seconds start on the first screen that can show the pill (not the welcome), and the flag
  // is written only once the pill has been on screen that long. A navigation before that restarts it on the next screen.
  useEffect(() => {
    if (path === "/urgent" || path === "/welcome") return;
    if (alreadyShown()) {
      setPhase("gone");
      return;
    }
    setPhase("shown");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const leave = window.setTimeout(() => {
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {
        /* private mode: the pill simply shows again next open */
      }
      setPhase(reduce ? "gone" : "leaving");
    }, SHOW_MS);
    const gone = window.setTimeout(() => setPhase("gone"), SHOW_MS + LEAVE_MS);
    return () => {
      window.clearTimeout(leave);
      window.clearTimeout(gone);
    };
  }, [path]);

  if (phase === "pending" || phase === "gone" || path === "/urgent" || path === "/welcome")
    return null;
  return (
    <Link className={`help${phase === "leaving" ? " is-leaving" : ""}`} href="/urgent">
      <Icon name="shield-alert" size={20} />
      <span>{t("button")}</span>
    </Link>
  );
}
