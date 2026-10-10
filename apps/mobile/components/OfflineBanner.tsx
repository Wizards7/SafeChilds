"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Icon } from "./Icon";

// One line when the phone is offline. The plan and guidance keep working; only analysis, links and the directory need the network.
export function OfflineBanner() {
  const t = useTranslations("pwa");
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    setOffline(!navigator.onLine);
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  if (!offline) return null;
  return (
    <div className="banner offline offline-global" role="status">
      <Icon name="wifi-off" />
      <span>{t("offline")}</span>
    </div>
  );
}
