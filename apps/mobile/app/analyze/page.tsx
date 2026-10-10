"use client";

// M1 placeholder for the first step only (the rules). The four-step flow lands in M2.
// Skipping is a first-class action: the plan never depends on analysis.

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Icon } from "../../components/Icon";
import { TopBar } from "../../components/TopBar";

export default function AnalyzePage() {
  const t = useTranslations("analyze");
  return (
    <>
      <TopBar title={t("title")} backHref="/question" />
      <main className="no-nav" style={{ gap: "var(--space-4)" }}>
        <h1>{t("rules.title")}</h1>
        <div className="card">
          <ul className="rules">
            <li><Icon name="x" /><span>{t("rules.noIntimate")}</span></li>
            <li><Icon name="lock" /><span>{t("rules.deleted")}</span></li>
            <li><Icon name="info" /><span>{t("rules.notVerdict")}</span></li>
            <li><Icon name="check" /><span>{t("rules.planWorks")}</span></li>
          </ul>
        </div>
        <div className="spacer" />
        <div className="stack">
          <button className="btn btn-primary" disabled><Icon name="image" size={20} />{t("rules.choose")}</button>
          <Link className="btn btn-quiet" href="/plan">{t("rules.skip")}</Link>
        </div>
      </main>
    </>
  );
}
