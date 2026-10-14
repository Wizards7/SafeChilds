"use client";

// The timeline of «Мой случай» (2026-10-14): a week strip when the case spans two or more days, then one group per day
// (calendar tile + «Сегодня» / «Вчера» / the date), newest first. Every card is one tap target: a saved item opens its
// sheet, a screenshot opens the viewer, a finished step opens the plan. A saved address is shown, never a link.

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useRef, type ReactNode } from "react";
import { LINK_TIER_TEXT, ORIGINAL_MATCHES_TEXT, TIER_TEXT } from "@safechilds/analysis";
import { Icon } from "../../components/Icon";
import type { Evidence } from "../../lib/incident-store";
import { pick, type Locale } from "../../lib/locale";
import { relativeDay, shortUrl, stripDays, type Day, type Entry } from "../../lib/timeline";
import { formatDay, formatShortMonth, formatTime } from "./format";
import { useObjectUrl } from "./hooks";

const WEEKDAY = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

// Tone of a check result line: amber for evidence or signs, the support teal for "this is your real photo", grey for
// everything else. Never green: "nothing found" is not "safe" (RULES.md).
type Tone = "warn" | "support" | "neutral";
export function toneOf(e: Evidence): Tone {
  if (e.kind === "imageCheck") return e.originalMatches ? "support" : e.tier === "evidence" || e.tier === "indicators" ? "warn" : "neutral";
  if (e.kind === "linkCheck") return e.tier === "known_dangerous" || e.tier === "signs" ? "warn" : "neutral";
  return "neutral";
}

export function resultTitle(e: Extract<Evidence, { kind: "imageCheck" | "linkCheck" }>, locale: Locale): string {
  if (e.kind === "linkCheck") return pick(LINK_TIER_TEXT[e.tier].title, locale);
  return pick(e.originalMatches ? ORIGINAL_MATCHES_TEXT.title : TIER_TEXT[e.tier].title, locale);
}

function Thumb({ blob, badge }: { blob: Blob; badge?: string }) {
  const url = useObjectUrl(blob);
  return (
    <span className="tile thumb">
      {url && <img src={url} alt="" width={48} height={48} />}
      {badge && <span className="badge-ic"><Icon name={badge} size={14} /></span>}
    </span>
  );
}

function EntryCard({ entry, locale, isNew, onOpen }: { entry: Entry; locale: Locale; isNew: boolean; onOpen: (e: Evidence) => void }) {
  const t = useTranslations("incident");
  const cls = `tl-card${isNew ? " is-new" : ""}`;
  const time = <time className="tm" dateTime={entry.at.toISOString()}>{formatTime(entry.at)}</time>;
  if (entry.type === "step") {
    return (
      <Link id={entry.key} className={cls} href="/plan">
        <span className="tile ok"><Icon name="circle-check" /></span>
        <span className="body"><span className="t">{pick(entry.step.title, locale)}</span><span className="d">{t("item.stepDone")}</span></span>
        {time}
      </Link>
    );
  }
  const e = entry.e;
  let tile: ReactNode;
  let title: string;
  let lines: ReactNode;
  switch (e.kind) {
    case "screenshot":
      tile = <Thumb blob={e.value} />;
      title = t("item.screenshot");
      lines = <span className="d">{e.takenAt ? t("item.taken") : t("item.added")}</span>;
      break;
    case "url":
      tile = <span className="tile blue"><Icon name="link" /></span>;
      title = t("item.link");
      lines = <span className="d addr">{shortUrl(e.value)}</span>;
      break;
    case "imageCheck":
      tile = e.image ? <Thumb blob={e.image} badge="scan-search" /> : <span className="tile blue"><Icon name="scan-search" /></span>;
      title = t("item.imageCheck");
      lines = <span className={`d ${toneOf(e)}`}>{resultTitle(e, locale)}</span>;
      break;
    case "linkCheck":
      tile = <span className="tile blue"><Icon name="search" /></span>;
      title = t("item.linkCheck");
      lines = (
        <>
          <span className={`d ${toneOf(e)}`}>{resultTitle(e, locale)}</span>
          <span className="d addr">{e.finalHost ?? shortUrl(e.url)}</span>
        </>
      );
      break;
    case "note":
      tile = <span className="tile"><Icon name="notepad-text" /></span>;
      title = t("item.note");
      lines = <span className="d clamp">{e.value}</span>;
      break;
  }
  return (
    <button type="button" id={entry.key} className={cls} onClick={() => onOpen(e)}>
      {tile}
      <span className="body"><span className="t">{title}</span>{lines}</span>
      {time}
    </button>
  );
}

export function WeekStrip({ days, now, selected, onPick }: { days: readonly Day[]; now: Date; selected: string; onPick: (key: string) => void }) {
  const t = useTranslations("incident");
  const tp = useTranslations("people");
  const counts = new Map(days.map((d) => [d.key, d.entries.length]));
  const cells = stripDays(new Set(counts.keys()), now);
  const track = useRef<HTMLDivElement>(null);
  // Open on this week: the earlier weeks sit to the left, a swipe away.
  useEffect(() => {
    const el = track.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [cells.length]);
  return (
    <div className="strip" role="group" aria-label={t("strip.label")}>
      <div className="strip-track" ref={track}>
        {cells.map((c) => {
          const inner = (
            <>
              <span className="wd">{tp(`day.${WEEKDAY[c.date.getDay()]}`)}</span>
              <span className="n">{c.date.getDate()}</span>
              <span className={`dot${c.active ? "" : " none"}`} />
            </>
          );
          const sel = c.key === selected ? " sel" : "";
          return c.active ? (
            <button key={c.key} type="button" className={`sd active${sel}`} aria-pressed={c.key === selected} aria-label={t("strip.day", { date: formatDay(c.date, now), n: counts.get(c.key) ?? 0 })} onClick={() => onPick(c.key)}>
              {inner}
            </button>
          ) : (
            <span key={c.key} className={`sd${c.future ? " future" : ""}${sel}`} aria-hidden="true">{inner}</span>
          );
        })}
      </div>
    </div>
  );
}

export function Timeline({ days, now, locale, newKey, onOpen }: { days: readonly Day[]; now: Date; locale: Locale; newKey: string | null; onOpen: (e: Evidence) => void }) {
  const t = useTranslations("incident");
  return (
    <>
      {days.map((d) => {
        const rel = relativeDay(d.date, now);
        const date = formatDay(d.date, now);
        return (
          <section key={d.key} className="day" aria-labelledby={`h-${d.key}`}>
            <div className="day-h" id={`day-${d.key}`}>
              <span className="cal" aria-hidden="true"><b>{d.date.getDate()}</b><span>{formatShortMonth(d.date)}</span></span>
              <h3 id={`h-${d.key}`}>
                {rel ? t(`day.${rel}`) : date}
                {rel && <span className="sr-only">, {date}</span>}
              </h3>
            </div>
            <div className="tl-list">
              {d.entries.map((entry) => <EntryCard key={entry.key} entry={entry} locale={locale} isNew={entry.key === newKey} onOpen={onOpen} />)}
            </div>
          </section>
        );
      })}
    </>
  );
}
