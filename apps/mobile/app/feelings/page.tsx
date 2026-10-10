"use client";

// Eight answers, "не хочу отвечать" is a first-class one. Never diagnoses: the answer only picks which support to offer.

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { BREATHE_FOR, FEELING_LABEL, FEELINGS, FEELINGS_HINT, FEELINGS_QUESTION, type Feeling } from "@safechilds/guidance";
import { Icon } from "../../components/Icon";
import { TopBar } from "../../components/TopBar";
import { incidentStore } from "../../lib/incident-store";
import { pick, type Locale } from "../../lib/locale";
import { useIncident } from "../../lib/use-incident";

export default function FeelingsPage() {
  const t = useTranslations("feelings");
  const locale = useLocale() as Locale;
  const { incident } = useIncident();
  const [feeling, setFeeling] = useState<Feeling | null>(incident?.profile.feeling ?? null);

  const choose = async (f: Feeling) => {
    setFeeling(f);
    if (incident) await incidentStore.setFeeling(f);
  };
  const breatheFirst = feeling ? BREATHE_FOR.has(feeling) : true;

  return (
    <>
      <TopBar title={t("title")} back={false} />
      <main>
        <div>
          <h1>{pick(FEELINGS_QUESTION, locale)}</h1>
          <p className="sub" style={{ marginTop: "var(--space-2)" }}>{pick(FEELINGS_HINT, locale)}</p>
        </div>
        <div className="grid2" role="group" aria-label={pick(FEELINGS_QUESTION, locale)}>
          {FEELINGS.map((f) => (
            <button key={f} className="btn btn-secondary" aria-pressed={feeling === f} onClick={() => choose(f)}>{pick(FEELING_LABEL[f], locale)}</button>
          ))}
        </div>
        <div className="stack" style={{ marginTop: "var(--space-2)" }}>
          {breatheFirst ? (
            <>
              <Link className="btn btn-support" href="/breathe"><Icon name="heart" size={20} />{t("breathe")}</Link>
              <Link className="btn btn-secondary" href="/people">{t("person")}</Link>
            </>
          ) : (
            <>
              <Link className="btn btn-support" href="/people"><Icon name="heart" size={20} />{t("person")}</Link>
              <Link className="btn btn-secondary" href="/breathe">{t("breathe")}</Link>
            </>
          )}
          <Link className="btn btn-quiet" href={incident ? "/plan" : "/"}>{incident ? t("backToPlan") : t("backHome")}</Link>
        </div>
      </main>
    </>
  );
}
