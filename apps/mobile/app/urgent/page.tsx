"use client";

// Safety first: tell an adult (ready message), verified numbers only (empty state until a human verified them),
// the directory. Nothing that delays the human step. Reachable from the safety check and from the help button.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { ADULT_MESSAGE, ITEMS, NOT_YOUR_FAULT, urgentLinesFor } from "@safechilds/guidance";
import { Icon } from "../../components/Icon";
import { MessageButton } from "../../components/MessageButton";
import { TopBar } from "../../components/TopBar";
import { pick, type Locale } from "../../lib/locale";
import { afterSafety } from "../../lib/next-step";
import { useTRPC } from "../../lib/trpc";
import { useIncident } from "../../lib/use-incident";
import "./urgent.css";

export default function UrgentPage() {
  const router = useRouter();
  const locale = useLocale() as Locale;
  const t = useTranslations("urgent");
  const { incident, loading } = useIncident();
  const trpc = useTRPC();
  const helplines = useQuery(trpc.directory.helplines.queryOptions());
  if (loading) return null;

  const category = incident?.profile.category ?? "unknown";
  const lines = incident ? urgentLinesFor(ITEMS, incident.profile) : [];
  const message = pick(ADULT_MESSAGE[category], locale);
  const continueHref = incident ? afterSafety(incident.profile) : "/";
  const verified = (helplines.data ?? []).filter((h) => h.verifiedAt && h.number && (category === "unknown" || h.categories.includes(category)));

  return (
    <>
      <TopBar title="" backHref={incident ? "/safety" : "/"} />
      <main className="no-nav urgent">
        <div>
          <h1>{t("headline")}</h1>
          <p className="fault">{pick(NOT_YOUR_FAULT, locale)}</p>
          {lines.map((l) => <p key={l.id} className="sub">{pick(l.text, locale)}</p>)}
        </div>

        <section className="card card-danger col">
          <div className="head"><Icon name="users" />{t("adult.title")}</div>
          <p className="small body">{t("adult.body")}</p>
          <div className="msg">{message}</div>
          <MessageButton text={message} variant="danger" />
        </section>

        <section className="stack">
          <h3>{t("call")}</h3>
          {helplines.isPending && <div className="sk" style={{ height: 56 }} />}
          {verified.map((h) => (
            <a key={h.id} className="num" href={`tel:${h.number}`}>
              <Icon name="phone" />
              <b>{pick(h.name, locale)}</b>
              <span className="n">{h.number}</span>
            </a>
          ))}
          {!helplines.isPending && verified.length === 0 && (
            <div className="card card-neutral col">
              <div className="head"><Icon name="info" />{t("numbers.pendingTitle")}</div>
              <p className="small">{t("numbers.pendingBody")}</p>
            </div>
          )}
        </section>

        <Link className="option support" href="/people?urgent=1">
          <span className="ic"><Icon name="heart" /></span>
          <span className="body"><span className="t">{t("people.title")}</span><span className="d">{t("people.sub")}</span></span>
          <Icon name="chevron-right" className="i chev" />
        </Link>

        <div className="spacer" />
        <button className="btn btn-quiet" onClick={() => router.push(continueHref)}>{t("continue")}</button>
      </main>
    </>
  );
}
