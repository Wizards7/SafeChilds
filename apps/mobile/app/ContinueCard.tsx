"use client";

// "Continue" on Home when an incident exists on this device. Reads IndexedDB; renders nothing otherwise.

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { PLATFORM_LABEL, SITUATION_LABEL } from "@safechilds/guidance";
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
  const done = Object.values(incident.steps).filter((s) => s.done).length;
  const title = pick(SITUATION_LABEL[incident.profile.situation], locale) + (incident.profile.platform ? ` · ${PLATFORM_LABEL[incident.profile.platform]}` : "");
  return (
    <section className="card continue">
      <div className="small">{t("continue.label")}</div>
      <h3>{title}</h3>
      <div><span className="badge badge-ok">{t("continue.steps", { done })}</span></div>
      <Link className="btn btn-primary" href="/plan">{t("continue.button")}</Link>
    </section>
  );
}
