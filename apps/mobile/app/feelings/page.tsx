"use client";

// The Поддержка tab (Ali's mockup, 2026-10-12): the human path first as a card, then "Как ты сейчас?" with six
// illustrated feelings, then the breathing card. Nothing on the tab waits for an answer: the hint says so, and
// "dont_know" / "prefer_not" stay in the guidance list for the bot without a button here. Never diagnoses: the
// answer only picks which support to offer.

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { FEELING_LABEL, FEELINGS_QUESTION, type Feeling } from "@safechilds/guidance";
import { Icon } from "../../components/Icon";
import { TopBar } from "../../components/TopBar";
import { incidentStore } from "../../lib/incident-store";
import { pick, type Locale } from "../../lib/locale";
import { useIncident } from "../../lib/use-incident";
import "./feelings.css";

const SHOWN: readonly Feeling[] = ["scared", "anxious", "angry", "sad", "ashamed", "overwhelmed"];

export default function FeelingsPage() {
  const t = useTranslations("feelings");
  const locale = useLocale() as Locale;
  const { incident } = useIncident();
  const [feeling, setFeeling] = useState<Feeling | null>(incident?.profile.feeling ?? null);

  const choose = async (f: Feeling) => {
    setFeeling(f);
    if (incident) await incidentStore.setFeeling(f);
  };

  return (
    <>
      <TopBar back={false} />
      <main className="feelings">
        <h1 className="page">{t("title")}</h1>

        <Link className="person" href="/people">
          <span className="spot">
            <img src="/feelings/person.webp" width={640} height={627} alt="" />
          </span>
          <span className="body">
            <span className="t">{t("person")}</span>
            <span className="d">{t("personSub")}</span>
          </span>
          <Icon name="chevron-right" className="i chev" />
        </Link>

        <div>
          <h2>{pick(FEELINGS_QUESTION, locale)}</h2>
          <p className="sub hint">{t("hint")}</p>
        </div>

        <div className="moods" role="group" aria-label={pick(FEELINGS_QUESTION, locale)}>
          {SHOWN.map((f) => (
            <button key={f} className="mood" aria-pressed={feeling === f} onClick={() => choose(f)}>
              <img src={`/feelings/${f}.webp`} width={640} height={470} alt="" />
              <span>{pick(FEELING_LABEL[f], locale)}</span>
            </button>
          ))}
        </div>

        <Link className="breathe" href="/breathe">
          <span className="ic">
            <Icon name="heart" />
          </span>
          <span className="body">
            <span className="t">{t("breatheTitle")}</span>
            <span className="d">{t("breatheSub")}</span>
          </span>
          <Icon name="chevron-right" className="i chev" />
        </Link>

        {incident && (
          <div className="center">
            <Link className="btn btn-quiet back" href="/plan">
              {t("backToPlan")}
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
