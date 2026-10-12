"use client";

// The "Мой случай" tab (route /incident, unchanged; the tab was "Профиль" until 2026-10-12 evening): the one incident — summary, evidence (on this phone only), steps —
// then Настройки (language, privacy), the privacy line, start over with confirmation. No account anywhere.

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { composePlan, ITEMS, PLATFORM_LABEL, SAFETY_LABEL, SITUATION_LABEL } from "@safechilds/guidance";
import { TIER_TEXT } from "@safechilds/analysis";
import { Icon, ICONS_URL } from "../../components/Icon";
import { TopBar } from "../../components/TopBar";
import { LanguageToggle } from "../LanguageToggle";
import { incidentStore, type Evidence } from "../../lib/incident-store";
import { pick, type Locale } from "../../lib/locale";
import { useIncident } from "../../lib/use-incident";
import "./incident.css";

function Settings({ locale, t }: { locale: Locale; t: ReturnType<typeof useTranslations<"incident">> }) {
  return (
    <section className="stack">
      <div className="sec"><h3>{t("settings.title")}</h3></div>
      <div className="settings">
        <div className="row"><span className="t">{t("settings.language")}</span><LanguageToggle current={locale} long /></div>
        <Link className="row" href="/privacy"><span className="t">{t("settings.privacy")}</span><Icon name="chevron-right" className="i chev" /></Link>
      </div>
    </section>
  );
}

function Thumb({ e }: { e: Evidence }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!(e.value instanceof Blob)) return;
    const u = URL.createObjectURL(e.value);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [e.value]);
  return <div className="img thumb" style={url ? { backgroundImage: `url(${url})`, backgroundSize: "cover" } : undefined} aria-label="screenshot" />;
}

export default function IncidentPage() {
  const locale = useLocale() as Locale;
  const t = useTranslations("incident");
  const { incident, loading, refresh } = useIncident();
  const [confirming, setConfirming] = useState(false);
  const [linkInput, setLinkInput] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  if (loading) return null;

  if (!incident) {
    return (
      <>
        <TopBar title={t("title")} back={false} />
        <main>
          <section className="card card-neutral col empty">
            <div className="head"><Icon name="folder" />{t("empty.title")}</div>
            <p className="small">{t("empty.body")}</p>
            <Link className="btn btn-primary" href="/">{t("empty.cta")}</Link>
          </section>
          <Settings locale={locale} t={t} />
        </main>
      </>
    );
  }

  const plan = composePlan(ITEMS, incident.profile);
  const steps = [...plan.now, ...plan.later];
  const done = steps.filter((s) => incident.steps[s.id]?.done).length;
  const title = pick(SITUATION_LABEL[incident.profile.situation], locale) + (incident.profile.platform ? ` · ${PLATFORM_LABEL[incident.profile.platform]}` : "");
  // Browsers ship no Tajik date locale; Russian month names are read by every Tajik speaker, English ones are not.
  const started = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" }).format(new Date(incident.createdAt));

  const addLink = async () => {
    let url: URL;
    try {
      url = new URL(linkInput.trim());
      if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error();
    } catch {
      setLinkError(t("evidence.linkError"));
      return;
    }
    await incidentStore.addEvidence({ kind: "url", value: url.href });
    setLinkInput("");
    setLinkError(null);
    await refresh();
  };

  const addScreenshot = async (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    await incidentStore.addEvidence({ kind: "screenshot", value: file });
    await refresh();
  };

  const links = incident.evidence.filter((e) => e.kind === "url");
  const shots = incident.evidence.filter((e) => e.kind === "screenshot");

  return (
    <>
      <TopBar title={t("title")} back={false} />
      <main>
        <section className="card summary">
          <div className="small">{t("started", { date: started })}</div>
          <h2>{title}</h2>
          <div className="row">
            {incident.profile.safety && <span className="badge">{pick(SAFETY_LABEL[incident.profile.safety], locale)}</span>}
            {incident.analysis && <span className="badge">{t("analysis")}: {pick(TIER_TEXT[incident.analysis.tier].title, locale)}</span>}
            <span className="badge">{t("steps", { done, total: steps.length })}</span>
          </div>
          <Link className="btn btn-primary" href="/plan">{t("continue")}</Link>
        </section>

        <section className="stack">
          <div className="sec"><h3>{t("evidence.title")}</h3></div>
          {links.map((e) => (
            <div key={e.id} className="ev">
              <span className="ic"><Icon name="copy" /></span>
              <span className="body"><span className="t">{String(e.value)}</span><span className="d">{t("evidence.link")}</span></span>
            </div>
          ))}
          <div className="field">
            <label htmlFor="link">{t("evidence.addLink")}</label>
            <div className="addrow">
              <input id="link" type="url" inputMode="url" autoComplete="off" value={linkInput} onChange={(e) => setLinkInput(e.target.value)} aria-invalid={!!linkError} />
              <button className="btn btn-secondary" onClick={addLink} disabled={!linkInput.trim()}>{t("evidence.add")}</button>
            </div>
            {linkError && <div className="error">{linkError}</div>}
          </div>
          <div className="thumbs">
            {shots.map((e) => <Thumb key={e.id} e={e} />)}
            <button className="img thumb add" onClick={() => fileRef.current?.click()}>{t("evidence.addShot")}</button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => addScreenshot(e.target.files?.[0])} />
          </div>
        </section>

        <section className="stack">
          <div className="sec"><h3>{t("stepsTitle")}</h3><Link className="btn btn-secondary small-btn" href="/plan">{t("openPlan")}</Link></div>
          <div className="steps">
            {steps.map((s) => {
              const isDone = incident.steps[s.id]?.done ?? false;
              return (
                <div key={s.id} className={`row${isDone ? " done" : ""}`}>
                  <span className="box">{isDone && <svg><use href={`${ICONS_URL}#check`} /></svg>}</span>
                  <span className="t">{pick(s.title, locale)}</span>
                </div>
              );
            })}
          </div>
        </section>

        <Settings locale={locale} t={t} />

        <div className="privacy"><Icon name="lock" size={18} />{t("privacy")}</div>

        {confirming ? (
          <section className="card card-danger col">
            <div className="head"><Icon name="triangle-alert" />{t("reset.confirmTitle")}</div>
            <p className="small">{t("reset.confirmBody")}</p>
            <div className="row2">
              <button className="btn btn-secondary" onClick={() => setConfirming(false)}>{t("reset.cancel")}</button>
              <button className="btn btn-danger" onClick={async () => { await incidentStore.clear(); setConfirming(false); await refresh(); }}>{t("reset.confirm")}</button>
            </div>
          </section>
        ) : (
          <button className="btn btn-quiet reset" onClick={() => setConfirming(true)}>{t("reset.button")}</button>
        )}
      </main>
    </>
  );
}
