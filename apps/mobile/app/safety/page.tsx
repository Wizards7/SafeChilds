"use client";

// One question, four answers, nothing else. Threat / unsure / urgent → /urgent. Always the screen after the situation.

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { SAFETY_ANSWERS, SAFETY_HINT, SAFETY_LABEL, SAFETY_QUESTION, URGENT_SAFETY, type SafetyAnswer } from "@safechilds/guidance";
import { TopBar } from "../../components/TopBar";
import { incidentStore } from "../../lib/incident-store";
import { pick, type Locale } from "../../lib/locale";
import { afterSafety } from "../../lib/next-step";
import { useIncident } from "../../lib/use-incident";
import "./safety.css";

export default function SafetyPage() {
  const router = useRouter();
  const locale = useLocale() as Locale;
  const t = useTranslations("common");
  const { incident, loading } = useIncident({ requireIncident: true });
  const [busy, setBusy] = useState(false);
  if (loading || !incident) return null;

  const answer = async (a: SafetyAnswer) => {
    setBusy(true);
    const next = await incidentStore.setSafety(a);
    if (!next) return router.replace("/");
    router.push(URGENT_SAFETY.has(a) ? "/urgent" : afterSafety(next.profile));
  };

  return (
    <>
      <TopBar title="" backHref="/" />
      <main className="no-nav safety">
        <div>
          <h1>{pick(SAFETY_QUESTION, locale)}</h1>
          <p className="sub">{pick(SAFETY_HINT, locale)}</p>
        </div>
        <div className="stack">
          {SAFETY_ANSWERS.map((a) => (
            <button key={a} className={`btn answer ${a === "urgent" ? "btn-danger" : "btn-secondary"}`} disabled={busy} onClick={() => answer(a)}>
              {pick(SAFETY_LABEL[a], locale)}
            </button>
          ))}
        </div>
        <span className="sr-only">{t("loading")}</span>
      </main>
    </>
  );
}
