"use client";

// Shown once, on the plan, after the first step is ticked: "Add to home screen so it's always with you".
// Android/Chrome: the native prompt through beforeinstallprompt. iOS: the Share → Add to Home Screen hint.

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { meta } from "../lib/incident-store";
import { Icon } from "./Icon";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferred: BeforeInstallPromptEvent | null = null;
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
  });
}

export function InstallPrompt({ ready }: { ready: boolean }) {
  const t = useTranslations("pwa");
  const [show, setShow] = useState<"native" | "ios" | null>(null);

  useEffect(() => {
    if (!ready) return;
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
    if (standalone) return;
    void meta.get().then((m) => {
      if (m.installPromptShown) return;
      const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
      if (deferred) setShow("native");
      else if (ios) setShow("ios");
    });
  }, [ready]);

  if (!show) return null;
  const dismiss = async () => {
    await meta.set({ installPromptShown: true });
    setShow(null);
  };
  const install = async () => {
    if (!deferred) return dismiss();
    await deferred.prompt();
    await deferred.userChoice.catch(() => undefined);
    deferred = null;
    await dismiss();
  };
  return (
    <div className="card card-support install" role="region" aria-label={t("install.title")}>
      <div className="head"><Icon name="house" />{t("install.title")}</div>
      <p className="small">{show === "ios" ? t("install.ios") : t("install.body")}</p>
      <div className="row2">
        <button className="btn btn-secondary" onClick={dismiss}>{t("install.later")}</button>
        {show === "native" ? <button className="btn btn-support" onClick={install}>{t("install.cta")}</button> : <button className="btn btn-support" onClick={dismiss}>{t("install.ok")}</button>}
      </div>
    </div>
  );
}
