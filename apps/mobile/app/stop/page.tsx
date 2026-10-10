"use client";

// Extortion only: five lines, ten seconds, no choice — then two doors. Shown before the plan because blackmailers run a countdown.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect } from "react";
import { ITEMS, stopCardFor } from "@safechilds/guidance";
import { Icon } from "../../components/Icon";
import { TopBar } from "../../components/TopBar";
import { pick, type Locale } from "../../lib/locale";
import { useIncident } from "../../lib/use-incident";
import "./stop.css";

export default function StopPage() {
  const router = useRouter();
  const locale = useLocale() as Locale;
  const t = useTranslations("stop");
  const { incident, loading } = useIncident({ requireIncident: true });
  const card = incident ? stopCardFor(ITEMS, incident.profile) : null;
  useEffect(() => {
    if (!loading && incident && !card) router.replace("/plan");
  }, [loading, incident, card, router]);
  if (loading || !incident || !card) return null;

  return (
    <>
      <TopBar title="" backHref="/safety" />
      <main className="no-nav stop">
        <h1>{pick(card.title, locale)}</h1>
        <ul className="stoplist">
          {card.lines.map((l, i) => (
            <li key={i} className={i === card.lines.length - 1 ? "ok" : undefined}>
              <Icon name={i === card.lines.length - 1 ? "heart" : "x"} />
              <span>{pick(l, locale)}</span>
            </li>
          ))}
        </ul>
        <p className="small">{pick(card.note, locale)}</p>
        <div className="spacer" />
        <div className="doors">
          <Link className="btn btn-primary" href="/plan">{t("plan")}</Link>
          <Link className="btn btn-support" href="/breathe"><Icon name="heart" size={20} />{t("calm")}</Link>
        </div>
      </main>
    </>
  );
}
