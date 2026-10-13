"use client";

// Four steps: rules → two questions → local checks (+ compare with the original) → result.
// Result = tier + markers + "где смотреть" + next step. Optional and skippable at every step.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import {
  coverageLine,
  EVIDENCE_TEXT,
  IMAGE_CHECK_TEXT,
  imageCoverage,
  INDICATOR_TEXT,
  ORIGINAL_MATCHES_TEXT,
  REVERSE_SEARCH,
  SELF_CHECK_SIGNS,
  TIER_TEXT,
  isRaising,
  type Decision,
  type Evidence,
  type Explanation,
} from "@safechilds/analysis";
import { Icon } from "../../components/Icon";
import { StoreFailed } from "../../components/StoreFailed";
import { TopBar } from "../../components/TopBar";
import { analyzeImage } from "../../lib/analysis-api";
import { c2paEvidence, compareWithOriginal, exifEvidence } from "../../lib/client-checks";
import { incidentStore } from "../../lib/incident-store";
import { pick, type Locale } from "../../lib/locale";
import { useIncident } from "../../lib/use-incident";
import "./analyze.css";

type Step = "rules" | "q1" | "q2" | "checks" | "result";
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

function Look({ n, ex, locale, kind }: { n: string; ex: Explanation; locale: Locale; kind: "fact" | "maybe" | "none" }) {
  const t = useTranslations("analyze");
  return (
    <div className="look">
      <span className={`n${kind === "maybe" ? " maybe" : ""}`}>{n}</span>
      <div className="body">
        <div className="what">
          {pick(ex.what, locale)}
          {kind !== "none" && <span className={`badge ${kind === "fact" ? "badge-fact" : "badge-maybe"}`}>{kind === "fact" ? t("fact") : t("maybe")}</span>}
        </div>
        {ex.how && <div className="how">{pick(ex.how, locale)}</div>}
        {ex.means && <div className="means">{pick(ex.means, locale)}</div>}
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  const t = useTranslations("analyze");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const { incident, loading, failed } = useIncident({ requireIncident: true });
  const [step, setStep] = useState<Step>("rules");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [original, setOriginal] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [localEvidence, setLocalEvidence] = useState<Evidence[]>([]);
  const [decision, setDecision] = useState<(Decision & { offline: boolean }) | null>(null);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const originalRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const chooseFile = (f: File | undefined) => {
    if (!f) return;
    if (!ALLOWED.includes(f.type)) return setFileError(t("fileType"));
    if (f.size > 8 * 1024 * 1024) return setFileError(t("fileSize"));
    setFileError(null);
    setFile(f);
    setStep("q1");
  };

  const run = async (orig: File | null) => {
    if (!file) return;
    setStep("checks");
    const evidence: Evidence[] = [...(await exifEvidence(file)), await c2paEvidence(file)];
    if (orig) {
      const cmp = await compareWithOriginal(file, orig);
      if (cmp) evidence.push(cmp.evidence);
    }
    setLocalEvidence(evidence);
    const d = await analyzeImage(file, evidence);
    setDecision(d);
    await incidentStore.setAnalysis(d);
    setStep("result");
  };

  const saveToEvidence = async () => {
    if (!decision) return;
    const summary = [pick(TIER_TEXT[decision.tier].title, locale), ...decision.evidence.map((e) => pick(EVIDENCE_TEXT[e].what, locale))].join(" · ");
    await incidentStore.addEvidence({ kind: "note", value: `${t("title")}: ${summary}` });
    setSaved(true);
  };

  if (failed) return <StoreFailed />;
  if (loading || !incident) return null;

  return (
    <>
      <TopBar title={t("title")} backHref={step === "rules" ? "/question" : undefined} />
      <main className="no-nav analyze">
        {step === "rules" && (
          <>
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
              <button className="btn btn-primary" onClick={() => fileRef.current?.click()}><Icon name="image" size={20} />{t("rules.choose")}</button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => chooseFile(e.target.files?.[0])} />
              {fileError && <div className="error" role="alert">{fileError}</div>}
              <Link className="btn btn-quiet" href="/plan">{t("rules.skip")}</Link>
            </div>
          </>
        )}

        {step === "q1" && (
          <section className="q">
            <div className="progress">{t("q.progress", { n: 1 })}</div>
            <h1>{t("q1.title")}</h1>
            <div className="stack">
              <button className="btn btn-secondary answer" onClick={() => setStep("q2")}>{t("q1.me")}</button>
              <button className="btn btn-secondary answer" onClick={() => setStep("q2")}>{t("q1.known")}</button>
              <button className="btn btn-secondary answer" onClick={() => run(null)}>{t("q1.no")}</button>
            </div>
          </section>
        )}

        {step === "q2" && (
          <section className="q">
            <div className="progress">{t("q.progress", { n: 2 })}</div>
            <h1>{t("q2.title")}</h1>
            <p className="sub">{t("q2.sub")}</p>
            <div className="stack">
              <button className="btn btn-secondary answer" onClick={() => originalRef.current?.click()}>{t("q2.yes")}</button>
              <input ref={originalRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0] ?? null; setOriginal(f); void run(f); }} />
              <button className="btn btn-secondary answer" onClick={() => run(null)}>{t("q2.no")}</button>
            </div>
          </section>
        )}

        {step === "checks" && (
          <>
            {preview && <div className="img small" style={{ backgroundImage: `url(${preview})` }} />}
            <h3>{t("checks.title")}</h3>
            <div className="stack">
              {localEvidence.map((e) => (
                <div key={e} className="check"><Icon name={isRaising(e) ? "triangle-alert" : "info"} /><span className="t">{pick(EVIDENCE_TEXT[e].what, locale)}</span><span className="badge badge-fact">{t("fact")}</span></div>
              ))}
              <div className="check"><div className="sk dot" /><span className="t">{t("checks.model")}</span></div>
            </div>
            <p className="small">{t("checks.sent")}</p>
            <div className="spacer" />
            <Link className="btn btn-quiet" href="/plan">{t("checks.dontWait")}</Link>
          </>
        )}

        {step === "result" && decision && (
          <>
            {decision.originalMatches ? (
              <div className="card card-support col">
                <div className="head"><Icon name="check" />{pick(ORIGINAL_MATCHES_TEXT.title, locale)}</div>
                <p className="small body">{pick(ORIGINAL_MATCHES_TEXT.body, locale)}</p>
                <p className="small coverage">{coverageLine(imageCoverage(decision), IMAGE_CHECK_TEXT, locale)}</p>
              </div>
            ) : (
              <div className={`card col ${decision.tier === "evidence" || decision.tier === "indicators" ? "card-warning" : "card-neutral"}`}>
                <div className="head"><Icon name={decision.tier === "unavailable" ? "x" : decision.tier === "inconclusive" ? "circle-help" : "triangle-alert"} />{pick(TIER_TEXT[decision.tier].title, locale)}</div>
                <p className="small body">{pick(TIER_TEXT[decision.tier].body, locale)}</p>
                {decision.offline && <p className="small">{t("result.offline")}</p>}
                <p className="small coverage">{coverageLine(imageCoverage(decision), IMAGE_CHECK_TEXT, locale)}</p>
              </div>
            )}

            {preview && (
              <div className={`img${decision.markers.length ? "" : " small"}`} style={{ backgroundImage: `url(${preview})` }}>
                {decision.markers.map((m, i) => (
                  <span key={m.code} className="mark" style={{ left: `${m.x * 100}%`, top: `${m.y * 100}%`, background: "var(--neutral)" }}>{i + 1}</span>
                ))}
              </div>
            )}

            <h3>{t("result.where")}</h3>
            <div>
              {decision.evidence.filter((e) => e !== "original_matches" && e !== "exif_present").map((e) => (
                <Look key={e} n="!" ex={EVIDENCE_TEXT[e]} locale={locale} kind="fact" />
              ))}
              {decision.markers.map((m, i) => (
                <Look key={m.code} n={String(i + 1)} ex={INDICATOR_TEXT[m.code]} locale={locale} kind="maybe" />
              ))}
              <Look n="?" ex={REVERSE_SEARCH} locale={locale} kind="none" />
            </div>

            {decision.tier === "inconclusive" && !decision.originalMatches && (
              <>
                <h3>{t("result.selfCheck")}</h3>
                <ul className="signs">{SELF_CHECK_SIGNS.map((s, i) => <li key={i}>{pick(s, locale)}</li>)}</ul>
              </>
            )}

            <div className="stack">
              <button className="btn btn-primary" onClick={saveToEvidence} disabled={saved}><Icon name={saved ? "check" : "folder"} size={20} />{saved ? t("result.saved") : t("result.save")}</button>
              <Link className="btn btn-secondary" href="/plan">{decision.originalMatches ? t("result.planMisuse") : t("result.plan")}</Link>
              {(decision.tier === "indicators" || decision.tier === "inconclusive") && <Link className="btn btn-quiet" href="/people?review=1">{t("result.askPerson")}</Link>}
              {decision.offline && <button className="btn btn-quiet" onClick={() => run(original)}>{t("result.retry")}</button>}
            </div>
            <p className="small">{t("result.deleted")}</p>
          </>
        )}
      </main>
      {step !== "rules" && step !== "result" && <button className="sr-only" onClick={() => router.push("/plan")}>{t("rules.skip")}</button>}
    </>
  );
}
