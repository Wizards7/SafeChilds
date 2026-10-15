"use client";

// Tapping a situation starts the one incident on the device and goes to the safety check. If a case already exists
// (lib/next-step.ts startChoice, 2026-10-15): the same situation continues it where it stopped; another situation replaces
// a case with nothing in it at once, and asks first when something would be deleted (steps, links, screenshots), which
// never happens on a single tap (2026-10-12). «Продолжить текущий» goes where the case stopped, never past an unanswered
// safety check.

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { emptyProfile, type SituationId } from "@safechilds/guidance";
import { incidentStore } from "../lib/incident-store";
import { resumeHref, startChoice } from "../lib/next-step";
import { Icon } from "./Icon";

export function StartIncident({
  situation,
  className,
  children,
}: {
  situation: SituationId;
  className: string;
  children: ReactNode;
}) {
  const t = useTranslations("start");
  const te = useTranslations("error");
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [failed, setFailed] = useState(false);
  const [keepHref, setKeepHref] = useState("/plan");
  const cardRef = useRef<HTMLDivElement>(null);
  const keepRef = useRef<HTMLButtonElement>(null);

  // The card replaces the tapped button, so focus would fall back to the page: it moves to the safe choice, «Продолжить
  // текущий». A tile low on the screen opens its card under the bottom bar: the card is brought into view (2026-10-14).
  useEffect(() => {
    if (!confirming) return;
    const id = setTimeout(() => {
      keepRef.current?.focus({ preventScroll: true });
      cardRef.current?.scrollIntoView({ block: "nearest" });
    }, 0);
    return () => clearTimeout(id);
  }, [confirming]);

  // The store can fail (StorageUnavailable in lib/incident-store.ts): the button comes back and the error stays under it.
  const storeFailed = () => {
    setBusy(false);
    setFailed(true);
  };
  const storeError = failed && (
    <div className="banner error" role="alert">
      <Icon name="triangle-alert" />
      <span>
        <b>{te("title")}</b>
        <br />
        {te("body")}
      </span>
    </div>
  );

  const start = async () => {
    setBusy(true);
    setFailed(false);
    try {
      await incidentStore.start(emptyProfile(situation));
    } catch {
      return storeFailed();
    }
    router.push("/safety");
  };

  if (confirming) {
    return (
      <div ref={cardRef} className="card card-danger start-confirm" role="group" aria-label={t("title")}>
        <div className="head">
          <Icon name="triangle-alert" />
          {t("title")}
        </div>
        <p className="small">{t("body")}</p>
        <div className="row2">
          <button ref={keepRef} className="btn btn-secondary" onClick={() => router.push(keepHref)}>
            {t("keep")}
          </button>
          <button className="btn btn-danger" disabled={busy} onClick={start}>
            {t("new")}
          </button>
        </div>
        {storeError}
      </div>
    );
  }

  return (
    <>
      <button
        className={className}
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setFailed(false);
          let existing;
          try {
            existing = await incidentStore.get();
          } catch {
            return storeFailed();
          }
          const choice = startChoice(existing, situation);
          if (existing && choice === "resume") {
            router.push(resumeHref(existing.profile));
            return;
          }
          if (existing && choice === "confirm") {
            setKeepHref(resumeHref(existing.profile));
            setBusy(false);
            setConfirming(true);
            return;
          }
          await start();
        }}
      >
        {children}
      </button>
      {storeError}
    </>
  );
}
