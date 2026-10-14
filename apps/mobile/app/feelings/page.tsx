"use client";

// The Поддержка tab (Ali's mockup, 2026-10-12): the human path first as a card, then "Как ты сейчас?" with six
// illustrated feelings, then the breathing card. Nothing on the tab waits for an answer: the hint says so, and
// "dont_know" / "prefer_not" stay in the guidance list for the bot without a button here. Never diagnoses: the
// answer only picks which support to offer.
// A tap answers (Ali, 2026-10-14, after a safety / coping / honesty review): a reply card under the grid with one
// reviewed line (packages/guidance FEELING_REPLY) and one action that fits the feeling, plus the door to /urgent on
// every card (full-size on "scared", on extortion, or after an unsafe safety answer). Breathing never shows twice:
// when the reply is breathing, the breathing card moves into it.

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ABOUT,
  ADULT_MESSAGE,
  BREATHE_FOR,
  composePlan,
  FEELING_LABEL,
  FEELING_REPLY,
  FEELING_URGENT,
  FEELINGS_QUESTION,
  ITEMS,
  NOT_YOUR_FAULT,
  SHAME_SILENT,
  SIGN_CATEGORIES,
  URGENT_SAFETY,
  type Feeling,
  type SignCategory,
} from "@safechilds/guidance";
import { Icon } from "../../components/Icon";
import { MessageButton } from "../../components/MessageButton";
import { TopBar } from "../../components/TopBar";
import { incidentStore, type Incident } from "../../lib/incident-store";
import { pick, type Locale } from "../../lib/locale";
import { dayKey, stripDays } from "../../lib/timeline";
import { useIncident } from "../../lib/use-incident";
import { minutesThisWeek, picksByDay, type Pick } from "../../lib/wellbeing";
import { formatDay } from "../incident/format";
import "./feelings.css";

const SHOWN: readonly Feeling[] = ["scared", "anxious", "angry", "sad", "ashamed", "overwhelmed"];

// The breathing card, with this week's finished minutes when there are any: a count, no goal, no streak (2026-10-14).
function BreatheCard({ minutes }: { minutes: number }) {
  const t = useTranslations("feelings");
  return (
    <Link className="breathe" href="/breathe?from=feelings">
      <span className="ic">
        <Icon name="waves" />
      </span>
      <span className="body">
        <span className="t">{t("breatheTitle")}</span>
        <span className="d">{t("breatheSub")}</span>
        {minutes > 0 && <span className="m">{t("minutes", { n: minutes })}</span>}
      </span>
      <Icon name="chevron-right" className="i chev" />
    </Link>
  );
}

// The first step of the case's plan not yet ticked, from «Сейчас» on; undefined when every step is done.
function nextStep(incident: Incident) {
  const plan = composePlan(ITEMS, incident.profile);
  return [...plan.now, ...plan.later].find((s) => !incident.steps[s.id]?.done);
}

// «Твои отметки»: Monday-first day cards, each with the picture of the last feeling picked that day. No colour per feeling,
// no score, no trend; read to screen readers as the day and the feelings by name.
function FeelingMarks({ picks, now, locale }: { picks: readonly Pick[]; now: Date; locale: Locale }) {
  const t = useTranslations("feelings");
  const tp = useTranslations("people");
  const days = picksByDay(picks);
  const cells = stripDays(new Set(days.keys()), now);
  const track = useRef<HTMLUListElement>(null);
  const today = dayKey(now);
  // Open on this week: earlier weeks sit to the left, a swipe away.
  useEffect(() => {
    const el = track.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [cells.length]);
  const WEEKDAY = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
  return (
    <section className="marks" aria-labelledby="marks-title">
      <h2 id="marks-title">{t("marks.title")}</h2>
      <p className="sub hint">{t("marks.hint")}</p>
      <ul className="fs-strip" ref={track}>
        {cells.map((c) => {
          const picked = days.get(c.key) ?? [];
          const last = picked[picked.length - 1];
          const date = formatDay(c.date, now);
          const label = picked.length ? t("marks.day", { date, feelings: picked.map((f) => pick(FEELING_LABEL[f], locale)).join(", ") }) : t("marks.none", { date });
          return (
            <li key={c.key} className={`fs-day${c.key === today ? " today" : ""}${c.future ? " future" : ""}`} aria-label={label}>
              <span className="wd" aria-hidden="true">{tp(`day.${WEEKDAY[c.date.getDay()]}`)}</span>
              <span className="n" aria-hidden="true">{c.date.getDate()}</span>
              {last ? <span className="face"><img src={`/feelings/${last}.webp`} width={640} height={470} alt="" /></span> : <span className="none" aria-hidden="true" />}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Reply({ feeling, incident, locale, minutes }: { feeling: Feeling; incident: Incident | null; locale: Locale; minutes: number }) {
  const ti = useTranslations("incident");
  const ts = useTranslations("signs");
  const category = incident?.profile.category ?? "unknown";
  const signCategory = (SIGN_CATEGORIES as readonly string[]).includes(category) ? (category as SignCategory) : null;
  const unsafe = incident?.profile.safety != null && URGENT_SAFETY.has(incident.profile.safety);
  const strong = feeling === "scared" || category === "extortion" || unsafe;

  let line: string;
  let extra: ReactNode = null;
  let action: ReactNode;
  if (BREATHE_FOR.has(feeling)) {
    line = pick(feeling === "scared" ? FEELING_REPLY.scared : FEELING_REPLY.overwhelmed, locale);
    action = <BreatheCard minutes={minutes} />;
  } else if (feeling === "anxious") {
    const next = incident ? nextStep(incident) : undefined;
    if (!incident) {
      line = pick(FEELING_REPLY.anxious.noCase, locale);
      action = <Link className="btn btn-secondary" href="/">{ti("empty.cta")}</Link>;
    } else if (next) {
      line = pick(FEELING_REPLY.anxious.step, locale);
      extra = (
        <div className="step-next">
          <b>{pick(next.title, locale)}</b>
          {next.why && <span>{pick(next.why, locale)}</span>}
        </div>
      );
      action = <Link className="btn btn-primary" href="/plan">{ti("continue")}</Link>;
    } else {
      line = pick(FEELING_REPLY.anxious.allDone, locale);
      action = <BreatheCard minutes={minutes} />;
    }
  } else if (feeling === "sad") {
    line = pick(FEELING_REPLY.sad, locale);
    action = <MessageButton text={pick(ADULT_MESSAGE[category], locale)} variant="support" />;
  } else if (feeling === "ashamed") {
    line = pick(NOT_YOUR_FAULT, locale);
    const silent = signCategory ? ABOUT[signCategory].silent[SHAME_SILENT[signCategory]] : undefined;
    if (signCategory && silent) {
      extra = (
        <div className="quote">
          <b>{pick(silent.thought, locale)}</b>
          <span>{pick(silent.answer, locale)}</span>
        </div>
      );
      action = <Link className="btn btn-secondary" href={`/signs?c=${signCategory}#silent`}>{ts("silent")}</Link>;
    } else {
      action = <MessageButton text={pick(ADULT_MESSAGE.unknown, locale)} variant="support" />;
    }
  } else {
    // angry
    line = pick(incident ? FEELING_REPLY.angry.withCase : FEELING_REPLY.angry.noCase, locale);
    action = incident ? (
      <Link className="btn btn-primary" href="/incident#add">{ti("sheet.add")}</Link>
    ) : (
      <Link className="btn btn-secondary" href="/">{ti("empty.cta")}</Link>
    );
  }

  return (
    <>
      <p className="line">{line}</p>
      {extra}
      {action}
      <Link className={`urgent-row${strong ? " strong" : ""}`} href="/urgent">
        <Icon name="shield-alert" size={strong ? 22 : 18} />
        <span>{pick(FEELING_URGENT, locale)}</span>
        <Icon name="chevron-right" className="i chev" size={18} />
      </Link>
    </>
  );
}

export default function FeelingsPage() {
  const t = useTranslations("feelings");
  const locale = useLocale() as Locale;
  const { incident, refresh } = useIncident();
  const now = new Date();
  const minutes = incident ? minutesThisWeek(incident.breaths ?? [], now) : 0;
  // The tap of this visit; before any tap the saved pick (once the case has loaded) keeps its tile highlighted.
  const [picked, setPicked] = useState<Feeling | null>(null);
  const selected = picked ?? incident?.profile.feeling ?? null;
  const replyRef = useRef<HTMLElement>(null);

  // The reply sits under three rows of tiles, often below the fold: bring it into view so the tap visibly answers.
  useEffect(() => {
    if (!picked) return;
    const id = setTimeout(() => replyRef.current?.scrollIntoView({ block: "nearest" }), 0);
    return () => clearTimeout(id);
  }, [picked]);

  // The reply answers at once; the pick is then logged in the case and the strip re-read. If the phone's storage refuses,
  // the reply still stands and only the mark is missing from «Твои отметки».
  const choose = async (f: Feeling) => {
    setPicked(f);
    if (!incident) return;
    try {
      await incidentStore.setFeeling(f);
      await refresh();
    } catch {
      return;
    }
  };
  const breathingInReply = picked !== null && (BREATHE_FOR.has(picked) || (picked === "anxious" && !!incident && !nextStep(incident)));

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
            <button key={f} className="mood" aria-pressed={selected === f} onClick={() => choose(f)}>
              <img src={`/feelings/${f}.webp`} width={640} height={470} alt="" />
              <span>{pick(FEELING_LABEL[f], locale)}</span>
            </button>
          ))}
        </div>

        <section ref={replyRef} className={`reply${picked ? "" : " empty"}`} aria-live="polite">
          {picked && <Reply feeling={picked} incident={incident ?? null} locale={locale} minutes={minutes} />}
        </section>

        {!breathingInReply && <BreatheCard minutes={minutes} />}

        {incident && (incident.feelings?.length ?? 0) > 0 && <FeelingMarks picks={incident.feelings ?? []} now={now} locale={locale} />}

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
