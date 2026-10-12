"use client";

// The "Мой случай" tab (route /incident; redesigned 2026-10-12 night from Ali's mockup): the page title under the brand
// row, the one incident as a card (started, situation, platform chip, analysis tier when checked, progress, continue),
// evidence (on this phone only), the steps as real checkboxes (the same toggleStep the plan uses), the device line,
// delete with confirmation. Settings sit behind the gear in the header (/settings). No account anywhere.

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { composePlan, ITEMS, PLATFORM_LABEL, SITUATION_LABEL } from "@safechilds/guidance";
import { TIER_TEXT } from "@safechilds/analysis";
import { Icon, ICONS_URL } from "../../components/Icon";
import { TopBar } from "../../components/TopBar";
import { incidentStore, type Evidence } from "../../lib/incident-store";
import { pick, type Locale } from "../../lib/locale";
import { useIncident } from "../../lib/use-incident";
import "./incident.css";

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
  const ts = useTranslations("settings");
  const { incident, loading, refresh } = useIncident();
  const [confirming, setConfirming] = useState(false);
  const [linkInput, setLinkInput] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  if (loading) return null;

  // The gear: the only way to Настройки. Sits left of the "Помощь" pill, which stays on every screen (0001 § 5).
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

  const plan = composePlan(ITEMS, incident.profile);
  const steps = [...plan.now, ...plan.later];
  const done = steps.filter((s) => incident.steps[s.id]?.done).length;
  const progress = t("steps", { done, total: steps.length });
  const percent = steps.length ? Math.round((done / steps.length) * 100) : 0;
  // Browsers ship no Tajik date locale; Russian month names are read by every Tajik speaker, English ones are not.
  const started = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" }).format(new Date(incident.createdAt));

  const toggle = async (id: string) => {
    await incidentStore.toggleStep(id);
    await refresh();
  };

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
      <TopBar back={false} right={gear} />
      <main className="incident">
        <h1 className="page">{t("title")}</h1>

        <section className="card summary">
          <div className="small">{t("started", { date: started })}</div>
          <h2>{pick(SITUATION_LABEL[incident.profile.situation], locale)}</h2>
          {(incident.profile.platform || incident.analysis) && (
            <div className="chips-case">
              {incident.profile.platform && <span className="chip-case">{PLATFORM_LABEL[incident.profile.platform]}</span>}
              {incident.analysis && <span className="chip-case">{t("analysis")}: {pick(TIER_TEXT[incident.analysis.tier].title, locale)}</span>}
            </div>
          )}
          <div className="small">{progress}</div>
          <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={done} aria-label={progress}>
            <span style={{ width: `${percent}%` }} />
          </div>
          <Link className="btn btn-primary" href="/plan">{t("continue")}</Link>
        </section>

        <section className="stack">
          <div>
            <h3>{t("evidence.title")}</h3>
            <p className="sub small">{t("evidence.hint")}</p>
          </div>
          {links.map((e) => (
            <div key={e.id} className="ev">
              <span className="ic"><Icon name="copy" /></span>
              <span className="body"><span className="t">{String(e.value)}</span><span className="d">{t("evidence.link")}</span></span>
            </div>
          ))}
          <div className={`field${linkError ? " has-error" : ""}`}>
            <label htmlFor="link">{t("evidence.addLink")}</label>
            <div className="addrow">
              <input id="link" type="url" inputMode="url" autoComplete="off" placeholder={t("evidence.placeholder")} value={linkInput} onChange={(e) => setLinkInput(e.target.value)} aria-invalid={!!linkError} aria-describedby={linkError ? "link-error" : undefined} />
              <button type="button" className="btn btn-secondary" onClick={addLink} disabled={!linkInput.trim()}>{t("evidence.add")}</button>
            </div>
            {linkError && <div id="link-error" className="error">{linkError}</div>}
          </div>
          {shots.length > 0 && (
            <div className="thumbs">
              {shots.map((e) => <Thumb key={e.id} e={e} />)}
            </div>
          )}
          <button type="button" className="btn addshot" onClick={() => fileRef.current?.click()}>
            <Icon name="image-plus" size={20} />
            {t("evidence.addShot")}
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => addScreenshot(e.target.files?.[0])} />
        </section>

        <section className="stack">
          <div>
            <h3>{t("stepsTitle")}</h3>
            <p className="sub small">{t("stepsHint")}</p>
          </div>
          <div className="steps">
            {steps.map((s) => {
              const isDone = incident.steps[s.id]?.done ?? false;
              return (
                <button key={s.id} type="button" className={`row${isDone ? " done" : ""}`} role="checkbox" aria-checked={isDone} onClick={() => toggle(s.id)}>
                  <span className="box">{isDone && <svg><use href={`${ICONS_URL}#check`} /></svg>}</span>
                  <span className="t">{pick(s.title, locale)}</span>
                </button>
              );
            })}
          </div>
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
          <button type="button" className="btn btn-quiet reset" onClick={() => setConfirming(true)}>{t("reset.button")}</button>
        )}
      </main>
    </>
  );
}
