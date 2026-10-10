"use client";

// Link check: paste → backend expands redirects and runs the deterministic checks → four tiers, "где смотреть", next step.
// The kid never opens the link. Nothing is stored. Offline → unavailable with the general rules.

import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { LINK_TIER_TEXT, type LinkFinding } from "@safechilds/analysis";
import { Icon } from "../../components/Icon";
import { TopBar } from "../../components/TopBar";
import { incidentStore } from "../../lib/incident-store";
import { pick, type Locale } from "../../lib/locale";
import { useTRPC } from "../../lib/trpc";
import "../analyze/analyze.css";

function findingText(f: LinkFinding, t: ReturnType<typeof useTranslations<"link">>): { what: string; how: string; fact: boolean } {
  switch (f.kind) {
    case "blocklist":
      return { what: t("f.blocklist"), how: t("f.blocklistHow"), fact: true };
    case "lookalike":
      return { what: t("f.lookalike", { real: f.real }), how: `${f.host} ≠ ${f.real}`, fact: true };
    case "young_domain":
      return { what: t("f.young", { days: f.ageDays }), how: t("f.youngHow"), fact: true };
    case "shortener":
      return { what: t("f.shortener"), how: t("f.shortenerHow", { host: f.finalHost }), fact: true };
    case "asks_for_code_or_payment":
      return { what: t("f.code"), how: t("f.codeHow"), fact: false };
  }
}

export default function LinkPage() {
  const t = useTranslations("link");
  const locale = useLocale() as Locale;
  const trpc = useTRPC();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const check = useMutation(trpc.links.check.mutationOptions());

  const submit = () => {
    const v = url.trim();
    if (!/^https?:\/\//i.test(v)) return setError(t("urlError"));
    setError(null);
    check.mutate({ url: v });
  };

  const result = check.isError ? { tier: "unavailable" as const, findings: [] as LinkFinding[], finalUrl: null } : check.data;

  return (
    <>
      <TopBar title={t("title")} backHref="/question" />
      <main className="no-nav analyze">
        {!result && !check.isPending && (
          <>
            <h1>{t("headline")}</h1>
            <div className="field">
              <label htmlFor="url">{t("label")}</label>
              <input id="url" type="url" inputMode="url" autoComplete="off" placeholder="https://" value={url} onChange={(e) => setUrl(e.target.value)} aria-invalid={!!error} />
              {error && <div className="error">{error}</div>}
            </div>
            <p className="small">{t("note")}</p>
            <div className="spacer" />
            <div className="stack">
              <button className="btn btn-primary" onClick={submit} disabled={!url.trim()}><Icon name="search" size={20} />{t("check")}</button>
              <Link className="btn btn-quiet" href="/plan">{t("skip")}</Link>
            </div>
          </>
        )}

        {check.isPending && (
          <>
            <h3>{t("checking")}</h3>
            <div className="sk" style={{ height: 56 }} /><div className="sk" style={{ height: 56 }} />
            <p className="small">{t("checkingNote")}</p>
          </>
        )}

        {result && !check.isPending && (
          <>
            <div className={`card col ${result.tier === "known_dangerous" ? "card-danger" : result.tier === "signs" ? "card-warning" : "card-neutral"}`}>
              <div className="head"><Icon name={result.tier === "known_dangerous" ? "shield-alert" : result.tier === "signs" ? "triangle-alert" : "info"} />{pick(LINK_TIER_TEXT[result.tier].title, locale)}</div>
              <p className="small body">{pick(LINK_TIER_TEXT[result.tier].body, locale)}</p>
            </div>

            {result.findings.length > 0 && (
              <>
                <h3>{t("where")}</h3>
                <div>
                  {result.findings.map((f, i) => {
                    const x = findingText(f, t);
                    return (
                      <div key={i} className="look">
                        <span className={`n${x.fact ? "" : " maybe"}`}>{i + 1}</span>
                        <div className="body">
                          <div className="what">{x.what}<span className={`badge ${x.fact ? "badge-fact" : "badge-maybe"}`}>{x.fact ? t("fact") : t("maybe")}</span></div>
                          <div className="how">{x.how}</div>
                        </div>
                      </div>
                    );
                  })}
                  {result.finalUrl && result.finalUrl !== url.trim() && (
                    <div className="look"><span className="n">→</span><div className="body"><div className="what">{t("finalUrl")}</div><div className="how"><code>{result.finalUrl}</code></div></div></div>
                  )}
                </div>
              </>
            )}

            <h3>{t("nextTitle")}</h3>
            <ul className="signs">
              {(result.tier === "known_dangerous" || result.tier === "signs" ? ["noCodes", "ifEntered", "report"] : ["noCodes", "playStore", "words"]).map((k) => <li key={k}>{t(`next.${k}`)}</li>)}
            </ul>

            <div className="stack">
              <Link className="btn btn-primary" href="/plan">{t("plan")}</Link>
              <button className="btn btn-secondary" disabled={saved} onClick={async () => { await incidentStore.addEvidence({ kind: "note", value: `${t("title")}: ${url.trim()} — ${pick(LINK_TIER_TEXT[result.tier].title, locale)}` }); setSaved(true); }}>
                <Icon name={saved ? "check" : "folder"} size={20} />{saved ? t("saved") : t("save")}
              </button>
              {result.tier === "unavailable" && <button className="btn btn-quiet" onClick={() => check.reset()}>{t("retry")}</button>}
            </div>
          </>
        )}
      </main>
    </>
  );
}
