"use client";

// The "Мой случай" tab (route /incident). Redesigned 2026-10-14 (Ali): the case card (platform, situation, started,
// progress, continue), then «Доказательства» as a timeline of everything the kid saved here or from a check and every
// step they finished, grouped by day, with a week strip once the case spans two or more days; «+ Добавить» opens a sheet
// (a link or a screenshot), a card opens its sheet (copy / share / remove). Arriving from a save (/incident#e-<id>)
// scrolls to the new card and marks it for a moment. The steps checklist left this page: the plan owns the steps.
// Settings sit behind the gear (/settings); no "Помощь" pill on this tab (DESIGN.md); no account anywhere.

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { composePlan, ITEMS, PLATFORM_LABEL, SITUATION_LABEL } from "@safechilds/guidance";
import { Icon } from "../../components/Icon";
import { StoreFailed } from "../../components/StoreFailed";
import { TopBar } from "../../components/TopBar";
import { incidentStore, type Evidence } from "../../lib/incident-store";
import { pick, type Locale } from "../../lib/locale";
import { dayKey, entriesOf, groupByDay, relativeDay } from "../../lib/timeline";
import { useIncident } from "../../lib/use-incident";
import { formatDay } from "./format";
import { AddSheet, ItemSheet, ShotViewer, type SheetItem, type ShotItem } from "./sheets";
import { Timeline, WeekStrip } from "./Timeline";
import "./incident.css";

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function IncidentPage() {
  const locale = useLocale() as Locale;
  const t = useTranslations("incident");
  const ts = useTranslations("settings");
  const { incident, loading, failed, refresh } = useIncident();
  const [confirming, setConfirming] = useState(false);
  const [adding, setAdding] = useState(false);
  const [openItem, setOpenItem] = useState<SheetItem | null>(null);
  const [viewing, setViewing] = useState<ShotItem | null>(null);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [pickedDay, setPickedDay] = useState<string | null>(null);

  // Arriving from a save on /analyze or /link: the hash names the new card. Read once the case is loaded, then dropped
  // from the address so a reload does not mark it again.
  useEffect(() => {
    if (loading) return;
    const id = window.location.hash.slice(1);
    if (!id.startsWith("e-")) return;
    window.history.replaceState(window.history.state, "", window.location.pathname); // keep the router's own state
    setNewKey(id);
  }, [loading]);
  // The new card comes into view and keeps its mark for a moment (CSS fades it; none with reduced motion). A jump after
  // the commit, not a smooth scroll or an animation frame: both were dropped on arrival in testing (2026-10-14).
  useEffect(() => {
    if (!newKey) return;
    const jump = setTimeout(() => document.getElementById(newKey)?.scrollIntoView({ block: "center" }), 0);
    const id = setTimeout(() => setNewKey(null), 1600);
    return () => {
      clearTimeout(jump);
      clearTimeout(id);
    };
  }, [newKey]);

  if (failed) return <StoreFailed />;
  if (loading) return null;

  // The gear: the only way to Настройки.
  const gear = (
    <Link className="gear" href="/settings" aria-label={ts("title")}>
      <Icon name="settings" />
    </Link>
  );

  if (!incident) {
    return (
      <>
        <TopBar back={false} right={gear} />
        <main className="incident">
          <h1 className="page">{t("title")}</h1>
          <section className="card card-neutral col empty">
            <div className="head"><Icon name="folder" />{t("empty.title")}</div>
            <p className="small">{t("empty.body")}</p>
            <Link className="btn btn-primary" href="/">{t("empty.cta")}</Link>
          </section>
        </main>
      </>
    );
  }

  const now = new Date();
  const plan = composePlan(ITEMS, incident.profile);
  const steps = [...plan.now, ...plan.later];
  const done = steps.filter((s) => incident.steps[s.id]?.done).length;
  const progress = t("steps", { done, total: steps.length });
  const percent = steps.length ? Math.round((done / steps.length) * 100) : 0;
  const createdAt = new Date(incident.createdAt);
  const startedRel = relativeDay(createdAt, now);
  const startedDate = formatDay(createdAt, now);
  const started = startedRel === "today" ? t("startedToday", { date: startedDate }) : startedRel === "yesterday" ? t("startedYesterday", { date: startedDate }) : t("started", { date: startedDate });
  const days = groupByDay(entriesOf(incident));

  const open = (e: Evidence) => (e.kind === "screenshot" ? setViewing(e) : setOpenItem(e));
  const removeEvidence = async (id: string) => {
    await incidentStore.removeEvidence(id);
    await refresh();
  };
  const added = async (id: string) => {
    await refresh();
    setNewKey(`e-${id}`);
  };
  const pickDay = (key: string) => {
    setPickedDay(key);
    document.getElementById(`day-${key}`)?.scrollIntoView({ block: "start", behavior: reducedMotion() ? "auto" : "smooth" });
  };

  return (
    <>
      <TopBar back={false} right={gear} />
      <main className="incident">
        <h1 className="page">{t("title")}</h1>

        <section className="card summary">
          {incident.profile.platform && <span className="chip-case">{PLATFORM_LABEL[incident.profile.platform]}</span>}
          <h2>{pick(SITUATION_LABEL[incident.profile.situation], locale)}</h2>
          <div className="small">{started}</div>
          <div className="small prog-t">{progress}</div>
          <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={done} aria-label={progress}>
            <span style={{ width: `${percent}%` }} />
          </div>
          <Link className="btn btn-primary" href="/plan">{t("continue")}</Link>
        </section>

        <section className="evidence" aria-labelledby="ev-title">
          <div className="ev-head">
            <h2 id="ev-title">{t("evidence.title")}{incident.evidence.length > 0 && <span className="count">{incident.evidence.length}</span>}</h2>
            <button type="button" className="btn add" onClick={() => setAdding(true)}><Icon name="plus" size={20} /><span className="add-label">{t("evidence.addButton")}</span></button>
          </div>
          <p className="small ev-hint">{t("evidence.hint")}</p>

          {days.length >= 2 && <WeekStrip days={days} now={now} selected={pickedDay ?? dayKey(now)} onPick={pickDay} />}

          {days.length === 0 ? (
            <div className="tl-empty"><Icon name="folder" /><p className="small">{t("evidence.empty")}</p></div>
          ) : (
            <Timeline days={days} now={now} locale={locale} newKey={newKey} onOpen={open} />
          )}
        </section>

        <div className="device"><Icon name="smartphone" size={18} />{t("privacy")}</div>

        {confirming ? (
          <section className="card card-danger col">
            <div className="head"><Icon name="triangle-alert" />{t("reset.confirmTitle")}</div>
            <p className="small">{t("reset.confirmBody")}</p>
            <div className="row2">
              <button type="button" className="btn btn-secondary" onClick={() => setConfirming(false)}>{t("reset.cancel")}</button>
              <button type="button" className="btn btn-danger" onClick={async () => { await incidentStore.clear(); setConfirming(false); await refresh(); }}>{t("reset.confirm")}</button>
            </div>
          </section>
        ) : (
          <button type="button" className="btn btn-quiet reset" onClick={() => setConfirming(true)}><Icon name="trash-2" size={18} />{t("reset.button")}</button>
        )}

        <AddSheet open={adding} onClose={() => setAdding(false)} onAdded={added} />
        <ItemSheet item={openItem} now={now} locale={locale} onClose={() => setOpenItem(null)} onRemove={removeEvidence} />
        <ShotViewer e={viewing} now={now} onClose={() => setViewing(null)} onRemove={removeEvidence} />
      </main>
    </>
  );
}
