"use client";

// One row on Home when a case exists on this device: the situation and "Продолжить" → the plan. Reads IndexedDB;
// renders nothing otherwise. The full case lives in Профиль.

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { PLATFORM_LABEL, SITUATION_LABEL } from "@safechilds/guidance";
import { Icon } from "../components/Icon";
import { incidentStore, type Incident } from "../lib/incident-store";
import { pick, type Locale } from "../lib/locale";

export function ContinueCard() {
  const t = useTranslations("home");
  const locale = useLocale() as Locale;
  const [incident, setIncident] = useState<Incident | null>(null);
  useEffect(() => {
    let cancelled = false;
    void incidentStore.get().then((i) => {
      if (!cancelled) setIncident(i);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  if (!incident) return null;
  const title =
    pick(SITUATION_LABEL[incident.profile.situation], locale) +
    (incident.profile.platform ? ` · ${PLATFORM_LABEL[incident.profile.platform]}` : "");
  return (
    <Link className="continue-row" href="/plan">
      <span className="body">
        <span className="small">{t("continue.label")}</span>
        <span className="t">{title}</span>
      </span>
      <span className="go">
        {t("continue.button")}
        <Icon name="chevron-right" size={18} />
      </span>
    </Link>
  );
}
