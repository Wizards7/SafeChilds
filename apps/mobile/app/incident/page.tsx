"use client";

// The "Мой случай" tab (route /incident; redesigned 2026-10-12 night from Ali's mockup): the page title under the brand
// row, the one incident as a card (started, situation, platform chip, analysis tier when checked, progress, continue),
// evidence (on this phone only), the steps as real checkboxes (the same toggleStep the plan uses), the device line,
// delete with confirmation. Settings sit behind the gear in the header (/settings). No account anywhere.
// Evidence has a door out (2026-10-12 night): copy / share / remove on every saved link, a full-screen viewer with share
// and remove for every screenshot. Nothing leaves the phone unless the kid taps share.

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { composePlan, ITEMS, PLATFORM_LABEL, SITUATION_LABEL } from "@safechilds/guidance";
import { TIER_TEXT } from "@safechilds/analysis";
import { Icon, ICONS_URL } from "../../components/Icon";
import { StoreFailed } from "../../components/StoreFailed";
import { TopBar } from "../../components/TopBar";
import { incidentStore, type Evidence } from "../../lib/incident-store";
import { pick, type Locale } from "../../lib/locale";
import { useIncident } from "../../lib/use-incident";
import "./incident.css";

// Whether this phone has a share sheet; false on the server so hydration matches. No effect needed.
const noop = () => () => undefined;
const useCanShare = () => useSyncExternalStore(noop, () => typeof navigator.share === "function", () => false);
const useCanShareFiles = () => useSyncExternalStore(noop, () => typeof navigator.canShare === "function", () => false);
const isAbort = (e: unknown) => e instanceof DOMException && e.name === "AbortError"; // the kid closed the share sheet

function useObjectUrl(value: unknown) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!(value instanceof Blob)) return;
    const u = URL.createObjectURL(value);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [value]);
  return url;
}

// A saved link: copy, share where the phone has a sheet, remove behind an inline confirm. Never "open": a saved scam
// link must not be one tap from opening.
function LinkRow({ e, saved, onRemove }: { e: Evidence; saved: string; onRemove: () => Promise<void> }) {
  const t = useTranslations("incident");
  const tc = useTranslations("common");
  const canShare = useCanShare();
  const [state, setState] = useState<"idle" | "copied" | "copyFailed" | "shareFailed">("idle");
  const [asking, setAsking] = useState(false);
  useEffect(() => {
    if (state === "idle") return;
    const id = setTimeout(() => setState("idle"), 2000);
    return () => clearTimeout(id);
  }, [state]);
  const url = String(e.value);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
    } catch {
      setState("copyFailed");
    }
  };
  const share = async () => {
    try {
      await navigator.share({ url });
    } catch (err) {
      if (!isAbort(err)) setState("shareFailed");
    }
  };
  if (asking) {
    return (
      <div className="ev ask">
        <span className="body"><span className="t">{t("evidence.removeAsk")}</span><span className="d">{url}</span></span>
        <div className="row2">
          <button type="button" className="btn btn-secondary" onClick={() => setAsking(false)}>{t("evidence.keep")}</button>
          <button type="button" className="btn btn-danger" onClick={onRemove}>{t("evidence.remove")}</button>
        </div>
      </div>
    );
  }
  const sub = state === "copied" ? tc("copied") : state === "copyFailed" ? tc("copyFailed") : state === "shareFailed" ? t("evidence.shareFailed") : saved;
  return (
    <div className="ev">
      <span className="body"><span className="t">{url}</span><span className="d" aria-live="polite">{sub}</span></span>
      <div className="acts">
        <button type="button" className="act" onClick={copy} aria-label={t("evidence.copy")}><Icon name={state === "copied" ? "check" : "copy"} size={20} /></button>
        {canShare && <button type="button" className="act" onClick={share} aria-label={t("evidence.share")}><Icon name="share" size={20} /></button>}
        <button type="button" className="act danger" onClick={() => setAsking(true)} aria-label={t("evidence.remove")}><Icon name="trash-2" size={20} /></button>
      </div>
    </div>
  );
}

function Thumb({ e, onOpen }: { e: Evidence; onOpen: () => void }) {
  const t = useTranslations("incident");
  const url = useObjectUrl(e.value);
  return <button type="button" className="img thumb" style={url ? { backgroundImage: `url(${url})`, backgroundSize: "cover" } : undefined} aria-label={t("evidence.open")} onClick={onOpen} />;
}

// Full-screen view of one screenshot: a native modal dialog (the page behind is inert, focus stays inside, Esc and the
// backdrop close it, body scroll locked). Share the file where the phone can, remove behind an inline confirm.
function ShotViewer({ e, onClose, onRemove }: { e: Evidence | null; onClose: () => void; onRemove: (id: string) => Promise<void> }) {
  const t = useTranslations("incident");
  const ref = useRef<HTMLDialogElement>(null);
  const canShareFiles = useCanShareFiles();
  const [asking, setAsking] = useState(false);
  const [failed, setFailed] = useState(false);
  const url = useObjectUrl(e?.value);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (e && !d.open) d.showModal();
    if (!e && d.open) d.close();
  }, [e]);
  useEffect(() => {
    if (!e) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [e]);
  useEffect(() => {
    if (!failed) return;
    const id = setTimeout(() => setFailed(false), 2000);
    return () => clearTimeout(id);
  }, [failed]);
  const close = () => {
    setAsking(false);
    onClose();
  };
  const share = async () => {
    if (!e || !(e.value instanceof Blob)) return;
    const type = e.value.type || "image/png";
    const file = e.value instanceof File ? e.value : new File([e.value], `safechilds-${e.id.slice(0, 8)}.${type.split("/")[1] ?? "png"}`, { type });
    if (!navigator.canShare({ files: [file] })) {
      setFailed(true);
      return;
    }
    try {
      await navigator.share({ files: [file] });
    } catch (err) {
      if (!isAbort(err)) setFailed(true);
    }
  };
  return (
    <dialog ref={ref} className="viewer" onClose={close} onClick={(ev) => { if (ev.target === ref.current) close(); }} aria-label={t("evidence.open")}>
      <div className="bar">
        <span className="small" aria-live="polite">{failed ? t("evidence.shareFailed") : ""}</span>
        <button type="button" className="act" onClick={close} aria-label={t("evidence.close")}><Icon name="x" size={22} /></button>
      </div>
      <div className="pic">{url && <img src={url} alt="" />}</div>
      {asking ? (
        <section className="card card-danger col ask-card">
          <div className="head"><Icon name="triangle-alert" />{t("evidence.removeShotAsk")}</div>
          <div className="row2">
            <button type="button" className="btn btn-secondary" onClick={() => setAsking(false)}>{t("evidence.keep")}</button>
            <button type="button" className="btn btn-danger" onClick={async () => { if (e) await onRemove(e.id); close(); }}>{t("evidence.remove")}</button>
          </div>
        </section>
      ) : (
        <div className="foot">
          {canShareFiles && <button type="button" className="btn btn-secondary" onClick={share}><Icon name="share" size={18} />{t("evidence.share")}</button>}
          <button type="button" className="btn btn-danger" onClick={() => setAsking(true)}><Icon name="trash-2" size={18} />{t("evidence.remove")}</button>
        </div>
      )}
    </dialog>
  );
}

export default function IncidentPage() {
  const locale = useLocale() as Locale;
  const t = useTranslations("incident");
  const ts = useTranslations("settings");
  const { incident, loading, failed, refresh } = useIncident();
  const [confirming, setConfirming] = useState(false);
  const [linkInput, setLinkInput] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);
  const [viewing, setViewing] = useState<Evidence | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  if (failed) return <StoreFailed />;
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
  const dayMonth = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" });
  const started = dayMonth.format(new Date(incident.createdAt));

  const removeEvidence = async (id: string) => {
    await incidentStore.removeEvidence(id);
    await refresh();
  };

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
            <LinkRow key={e.id} e={e} saved={t("evidence.saved", { date: dayMonth.format(new Date(e.createdAt)) })} onRemove={() => removeEvidence(e.id)} />
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
              {shots.map((e) => <Thumb key={e.id} e={e} onOpen={() => setViewing(e)} />)}
            </div>
          )}
          <button type="button" className="btn addshot" onClick={() => fileRef.current?.click()}>
            <Icon name="image-plus" size={20} />
            {t("evidence.addShot")}
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => addScreenshot(e.target.files?.[0])} />
          <ShotViewer e={viewing} onClose={() => setViewing(null)} onRemove={removeEvidence} />
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
