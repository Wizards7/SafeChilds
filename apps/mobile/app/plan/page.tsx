"use client";

// The heart: the plan composed from packages/guidance for this profile. Platform picked here, only if a step needs it.
// Three steps "сейчас", the rest under "потом". Each step: one line, how/why collapsed, ready message where it applies.

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { composePlan, ITEMS, PLATFORM_LABEL, PLATFORMS, SITUATION_LABEL, type Platform, type StepItem } from "@safechilds/guidance";
import { Icon } from "../../components/Icon";
import { InstallPrompt } from "../../components/InstallPrompt";
import { MessageButton } from "../../components/MessageButton";
import { TopBar } from "../../components/TopBar";
import { incidentStore, type Incident } from "../../lib/incident-store";
import { pick, type Locale } from "../../lib/locale";
import { useIncident } from "../../lib/use-incident";
import "./plan.css";

function Step({ step, incident, locale, onToggle }: { step: StepItem; incident: Incident; locale: Locale; onToggle: () => void }) {
  const t = useTranslations("plan");
  const done = incident.steps[step.id]?.done ?? false;
  return (
    <details className={`step${done ? " is-done" : ""}`}>
      <summary>
        <button
          type="button"
          className="box"
          role="checkbox"
          aria-checked={done}
          aria-label={pick(step.title, locale)}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggle();
          }}
        >
          <svg><use href="/icons.svg#check" /></svg>
        </button>
        <span className="t">{pick(step.title, locale)}</span>
        <Icon name="chevron-down" className="i chev" />
      </summary>
      <div className="how">
        {step.how && <div><b>{t("how")}</b> {pick(step.how, locale)}{step.verifyOnDay && <span className="badge badge-maybe" style={{ marginLeft: 6 }}>VERIFY</span>}</div>}
        {step.why && <div><b>{t("why")}</b> {pick(step.why, locale)}</div>}
        {step.message && <MessageButton text={pick(step.message, locale)} variant="support" />}
      </div>
    </details>
  );
}

export default function PlanPage() {
  const locale = useLocale() as Locale;
  const t = useTranslations("plan");
  const { incident, loading, refresh } = useIncident({ requireIncident: true });
  if (loading || !incident) return null;

  const plan = composePlan(ITEMS, incident.profile);
  const needsPlatform = ITEMS.some((i) => i.kind === "step" && JSON.stringify(i.showWhen).includes('"platform"'));
  const toggle = async (id: string) => {
    await incidentStore.toggleStep(id);
    await refresh();
  };
  const setPlatform = async (p: Platform) => {
    await incidentStore.setPlatform(p);
    await refresh();
  };

  return (
    <>
      <TopBar title={t("title")} backHref="/" />
      <main>
        <div className="ctx">
          <b>{pick(SITUATION_LABEL[incident.profile.situation], locale)}</b>
          {incident.profile.safety === "safe" && <><span>·</span><span>{t("safe")}</span></>}
        </div>

        {needsPlatform && (
          <div>
            <p className="small" style={{ marginBottom: "var(--space-2)" }}>{t("where")}</p>
            <div className="chips" role="group" aria-label={t("where")}>
              {PLATFORMS.map((p) => (
                <button key={p} className="chip" aria-pressed={incident.profile.platform === p} onClick={() => setPlatform(p)}>
                  {PLATFORM_LABEL[p]}
                </button>
              ))}
            </div>
          </div>
        )}

        <section className="stack">
          <h2>{t("now")}</h2>
          {plan.now.map((s) => <Step key={s.id} step={s} incident={incident} locale={locale} onToggle={() => toggle(s.id)} />)}
          {plan.later.length > 0 && (
            <details className="later">
              <summary><Icon name="chevron-down" className="i chev" />{t("later", { n: plan.later.length })}</summary>
              <div className="stack">
                {plan.later.map((s) => <Step key={s.id} step={s} incident={incident} locale={locale} onToggle={() => toggle(s.id)} />)}
              </div>
            </details>
          )}
        </section>

        <Link className="option support" href="/people">
          <span className="ic"><Icon name="heart" /></span>
          <span className="body"><span className="t">{t("people.title")}</span><span className="d">{t("people.sub")}</span></span>
          <Icon name="chevron-right" className="i chev" />
        </Link>

        <InstallPrompt ready={Object.values(incident.steps).some((s) => s.done)} />
      </main>
    </>
  );
}
