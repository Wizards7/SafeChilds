"use client";

// The one category question, its own screen. The answer sets flags in the profile and decides the next screen.

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { ITEMS, questionFor } from "@safechilds/guidance";
import { StoreFailed } from "../../components/StoreFailed";
import { TopBar } from "../../components/TopBar";
import { incidentStore } from "../../lib/incident-store";
import { pick, type Locale } from "../../lib/locale";
import { afterQuestion } from "../../lib/next-step";
import { useIncident } from "../../lib/use-incident";
import "../safety/safety.css";

export default function QuestionPage() {
  const router = useRouter();
  const locale = useLocale() as Locale;
  const { incident, loading, failed } = useIncident({ requireIncident: true });
  const [busy, setBusy] = useState(false);
  const question = incident ? questionFor(ITEMS, incident.profile) : null;

  useEffect(() => {
    if (!loading && incident && !question) router.replace(afterQuestion(incident.profile, undefined));
  }, [loading, incident, question, router]);

  if (failed) return <StoreFailed />;
  if (loading || !incident || !question) return null;

  return (
    <>
      <TopBar title="" backHref="/safety" />
      <main className="no-nav safety">
        <div>
          <h1>{pick(question.text, locale)}</h1>
          {question.hint && <p className="sub">{pick(question.hint, locale)}</p>}
        </div>
        <div className="stack">
          {question.answers.map((a) => (
            <button
              key={a.id}
              className="btn btn-secondary answer"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                const next = a.sets ? await incidentStore.setFlags(a.sets) : incident;
                router.push(afterQuestion((next ?? incident).profile, a.next));
              }}
            >
              {pick(a.label, locale)}
            </button>
          ))}
        </div>
      </main>
    </>
  );
}
