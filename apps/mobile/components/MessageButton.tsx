"use client";

// Copy or share a ready message (to a trusted adult). Share sheet where the phone has one, clipboard otherwise.

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Icon } from "./Icon";

export function MessageButton({ text, variant = "secondary" }: { text: string; variant?: "secondary" | "support" | "danger" }) {
  const t = useTranslations("common");
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  useEffect(() => {
    if (state === "idle") return;
    const id = setTimeout(() => setState("idle"), 2000);
    return () => clearTimeout(id);
  }, [state]);

  const act = async () => {
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return; // the kid closed the share sheet
      setState("failed");
    }
  };

  const label = state === "copied" ? t("copied") : state === "failed" ? t("copyFailed") : t("sendMessage");
  return (
    <button className={`btn btn-${variant}`} onClick={act} aria-live="polite">
      <Icon name={state === "copied" ? "check" : "share"} size={18} />
      <span>{label}</span>
    </button>
  );
}
