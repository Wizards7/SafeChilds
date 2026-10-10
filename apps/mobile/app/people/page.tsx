"use client";

// The directory. Every row is demo until a human verified it, and says so. Two paths per card:
// "Свяжусь сам(а)" (we learn nothing) and "Пусть свяжутся" (the expiring contact request, prototype in the hackathon).

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Icon } from "../../components/Icon";
import { TopBar } from "../../components/TopBar";
import { pick, type Locale } from "../../lib/locale";
import { useTRPC } from "../../lib/trpc";
import { useIncident } from "../../lib/use-incident";
import "./people.css";

type Lang = "tg" | "ru";
type Format = "online" | "in_person";
const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

function Card({ p, locale }: { p: Professional; locale: Locale }) {
  const t = useTranslations("people");
  const trpc = useTRPC();
  const [open, setOpen] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState<string | null>(null);
  const report = useMutation(trpc.reports.create.mutationOptions());
  const meta = [
    p.languages.map((l) => (l === "tg" ? "тоҷикӣ" : l === "ru" ? "русский" : "english")).join(", "),
    p.city ? pick(p.city, locale) : t("meta.country"),
    t(`meta.${p.format}`),
    p.adolescentServices ? t("meta.teens") : null,
  ].filter(Boolean);
  return (
    <article className="pro">
      <div className="name">
        {pick(p.name, locale)}
        <span className={`badge ${p.verificationStatus === "verified" ? "badge-ok" : "badge-demo"}`}>{t(`status.${p.verificationStatus}`)}</span>
      </div>
      <div className="meta">{meta.map((m, i) => <span key={i}>{m}</span>)}</div>
      {p.availability && <div className="small">{t("hours")}: {WEEKDAYS.filter((d) => p.availability?.[d]).map((d) => `${t(`day.${d}`)} ${p.availability?.[d]?.[0]}–${p.availability?.[d]?.[1]}`).join(", ")}</div>}
      {open && <p className="small contact">{pick(p.contactMethod, locale)}</p>}
      <div className="actions">
        <button className="btn btn-secondary" onClick={() => setOpen((o) => !o)}>{open ? t("hideContact") : t("selfContact")}</button>
        <Link className={`btn btn-support${p.acceptingRequests ? "" : " is-disabled"}`} href={p.acceptingRequests ? `/request?p=${p.slug}` : "#"} aria-disabled={!p.acceptingRequests} onClick={(e) => { if (!p.acceptingRequests) e.preventDefault(); }}>
          {t("requestContact")}
        </Link>
      </div>
      {!reporting ? (
        <button className="report-link" onClick={() => setReporting(true)}>{t("report.link")}</button>
      ) : report.isSuccess ? (
        <p className="small">{t("report.thanks")}</p>
      ) : (
        <div className="field">
          <label htmlFor={`r-${p.id}`}>{t("report.label")}</label>
          <input id={`r-${p.id}`} type="text" value={reason} onChange={(e) => setReason(e.target.value)} aria-invalid={!!reasonError} />
          {reasonError && <div className="error">{reasonError}</div>}
          {report.isError && <div className="error">{t("report.failed")}</div>}
          <div className="actions">
            <button className="btn btn-secondary" onClick={() => setReporting(false)}>{t("report.cancel")}</button>
            <button className="btn btn-primary" disabled={report.isPending} onClick={() => { if (reason.trim().length < 3) return setReasonError(t("report.tooShort")); setReasonError(null); report.mutate({ professionalId: p.id, reason: reason.trim() }); }}>{t("report.send")}</button>
          </div>
        </div>
      )}
    </article>
  );
}

interface Professional {
  id: string;
  slug: string;
  name: { ru: string; tg: string };
  role: string;
  languages: string[];
  city: { ru: string; tg: string } | null;
  format: string;
  adolescentServices: boolean;
  verificationStatus: string;
  contactMethod: { ru: string; tg: string };
  availability: Record<string, [string, string]> | null;
  acceptingRequests: boolean;
  isDemo: boolean;
}

export default function PeoplePage() {
  const t = useTranslations("people");
  const locale = useLocale() as Locale;
  const params = useSearchParams();
  const trpc = useTRPC();
  const { incident } = useIncident();
  const [lang, setLang] = useState<Lang | null>(locale);
  const [format, setFormat] = useState<Format | null>(null);
  const list = useQuery(trpc.directory.list.queryOptions({ ...(lang ? { lang } : {}), ...(format ? { format } : {}), limit: 20 }));
  const helplines = useQuery(trpc.directory.helplines.queryOptions());
  const fromUrgent = params.get("urgent") === "1";
  const forReview = params.get("review") === "1";
  const category = incident?.profile.category ?? "unknown";
  const verified = (helplines.data ?? []).filter((h) => h.verifiedAt && h.number);
  const items = (list.data?.items ?? []) as Professional[];

  return (
    <>
      <TopBar title={t("title")} back={false} />
      <main>
        {list.isError && <div className="banner offline"><Icon name="wifi-off" />{t("offline")}</div>}

        {fromUrgent && (
          <section className="card card-danger col">
            <div className="head"><Icon name="phone" />{t("urgent.title")}</div>
            {verified.length > 0 ? verified.map((h) => <a key={h.id} className="num" href={`tel:${h.number}`}><Icon name="phone" /><b>{pick(h.name, locale)}</b><span>{h.number}</span></a>) : <p className="small body">{t("urgent.pending")}</p>}
          </section>
        )}

        {forReview && (
          <section className="card card-neutral col">
            <div className="head"><Icon name="info" />{t("review.title")}</div>
            <p className="small">{t("review.body")}</p>
          </section>
        )}

        <h1>{t("headline")}</h1>

        {items.some((p) => p.isDemo) && (
          <div className="card card-warning col">
            <div className="head"><Icon name="info" />{t("demo.title")}</div>
            <p className="small body">{t("demo.body")}</p>
          </div>
        )}

        <div className="filters">
          <div className="chips" role="group" aria-label={t("filters.lang")}>
            {(["tg", "ru"] as Lang[]).map((l) => <button key={l} className="chip" aria-pressed={lang === l} onClick={() => setLang(lang === l ? null : l)}>{l === "tg" ? "Тоҷикӣ" : "Русский"}</button>)}
          </div>
          <div className="chips" role="group" aria-label={t("filters.format")}>
            {(["online", "in_person"] as Format[]).map((f) => <button key={f} className="chip" aria-pressed={format === f} onClick={() => setFormat(format === f ? null : f)}>{t(`meta.${f}`)}</button>)}
          </div>
        </div>

        {list.isPending && <div className="stack"><div className="sk" style={{ height: 168 }} /><div className="sk" style={{ height: 168 }} /></div>}

        {!list.isPending && !list.isError && items.length === 0 && (
          <section className="card card-neutral col">
            <div className="head"><Icon name="search" />{t("empty.title")}</div>
            <p className="small">{t("empty.body")}</p>
            <button className="btn btn-secondary small-btn" onClick={() => { setLang(null); setFormat(null); }}>{t("empty.reset")}</button>
          </section>
        )}

        <div className="stack">
          {/* School psychologist first for cyberbullying (DESIGN.md); the list order is otherwise the API's. */}
          {[...items].sort((a, b) => (category === "cyberbullying" ? Number(b.role === "school_psychologist") - Number(a.role === "school_psychologist") : 0)).map((p) => <Card key={p.id} p={p} locale={locale} />)}
        </div>
      </main>
    </>
  );
}
