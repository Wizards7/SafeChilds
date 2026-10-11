"use client";

// Guided chat (plan 0005). The kid writes in their own words; the model returns codes; every bubble the kid reads is the
// reviewed guidance for those codes, or a reviewed fallback. Crisis words route to /urgent at once. The conversation lives
// in the incident on the phone and nowhere else.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { ITEMS, emptyProfile, type StepItem } from "@safechilds/guidance";
import type { Triage, TriageRoute } from "@safechilds/analysis";
import { Icon } from "../../components/Icon";
import { TopBar } from "../../components/TopBar";
import { incidentStore, type ChatTurn } from "../../lib/incident-store";
import { pick, type Locale } from "../../lib/locale";
import { useTRPC } from "../../lib/trpc";
import { useIncident } from "../../lib/use-incident";
import "./chat.css";

const STEPS = new Map(ITEMS.filter((i): i is StepItem => i.kind === "step").map((i) => [i.id, i]));
const ROUTE_HREF: Record<TriageRoute, string> = { plan: "/safety", people: "/people", urgent: "/urgent", signs: "/signs", ask: "/" };

function AppTurn({ turn, locale }: { turn: ChatTurn; locale: Locale }) {
  const t = useTranslations("chat");
  if (turn.failed) {
    return (
      <div className="bubble app">
        <p>{t("fallback")}</p>
        <div className="actions">
          <Link className="btn btn-secondary" href="/">{t("route.ask")}</Link>
          <Link className="btn btn-support" href="/people">{t("route.people")}</Link>
        </div>
      </div>
    );
  }
  const steps = (turn.items ?? []).map((id) => STEPS.get(id)).filter((s): s is StepItem => !!s);
  const route = turn.route ?? "ask";
  return (
    <div className="bubble app">
      {steps.length > 0 ? (
        <>
          <p className="lead">{t("found")}</p>
          <ol className="steps">
            {steps.map((s) => (
              <li key={s.id}>
                <b>{pick(s.title, locale)}</b>
                {s.how && <span>{pick(s.how, locale)}</span>}
              </li>
            ))}
          </ol>
        </>
      ) : (
        <p>{route === "urgent" ? t("urgentLine") : route === "ask" ? t("askMore") : t("noSteps")}</p>
      )}
      <div className="actions">
        <Link className={`btn ${route === "urgent" ? "btn-danger" : route === "people" ? "btn-support" : "btn-primary"}`} href={ROUTE_HREF[route]}>
          {t(`route.${route}`)}
        </Link>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const t = useTranslations("chat");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const trpc = useTRPC();
  const { incident, loading, refresh } = useIncident();
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const reply = useMutation(trpc.triage.reply.mutationOptions());
  const chat = incident?.chat ?? [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [chat.length, reply.isPending]);

  const send = async () => {
    const mine = text.trim();
    if (!mine || reply.isPending) return;
    setText("");
    if (!incident) await incidentStore.start(emptyProfile("unknown"));
    await incidentStore.addChat({ role: "me", text: mine });
    const current = await refresh();
    // Only the turns since the last urgent exit go to the model: a crisis statement is handled once, on the urgent screen.
    const turns = current?.chat ?? [];
    const lastUrgent = turns.map((c) => c.role === "app" && c.route === "urgent").lastIndexOf(true);
    const messages = turns.slice(lastUrgent + 1).filter((c) => c.role === "me" && c.text).map((c) => c.text as string).slice(-8);
    let result: Triage;
    try {
      result = await reply.mutateAsync({ messages });
    } catch {
      result = { status: "failed" };
    }
    if (result.status === "failed") {
      await incidentStore.addChat({ role: "app", failed: true });
      await refresh();
      return;
    }
    await incidentStore.setProfileFromCodes({ category: result.category, situation: result.situation, flags: Object.fromEntries(result.flags.map((f) => [f, true])), platform: result.platform });
    if (result.safety !== "ok") {
      await incidentStore.setSafety(result.safety);
      await incidentStore.addChat({ role: "app", items: [], route: "urgent" });
      router.push("/urgent");
      return;
    }
    await incidentStore.addChat({ role: "app", items: result.items, route: result.route });
    await refresh();
  };

  if (loading) return null;

  return (
    <>
      <TopBar title={t("title")} backHref="/" />
      <main className="no-nav chat">
        <div className="thread">
          <div className="bubble app intro">
            <p>{t("intro")}</p>
            <p className="small">{t("notHuman")}</p>
          </div>
          {chat.map((c) => (c.role === "me" ? <div key={c.id} className="bubble me">{c.text}</div> : <AppTurn key={c.id} turn={c} locale={locale} />))}
          {reply.isPending && <div className="bubble app pending" aria-live="polite">{t("thinking")}</div>}
          <div ref={endRef} />
        </div>
        <form
          className="composer"
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <label htmlFor="chat-text" className="sr-only">{t("label")}</label>
          <textarea id="chat-text" name="text" rows={2} maxLength={600} value={text} onChange={(e) => setText(e.target.value)} placeholder={t("placeholder")} autoComplete="off" />
          <button type="submit" className="btn btn-primary send" disabled={!text.trim() || reply.isPending} aria-label={t("send")}>
            <Icon name="chevron-right" size={22} />
          </button>
          <p className="small consent">{t("consent")}</p>
        </form>
      </main>
    </>
  );
}
