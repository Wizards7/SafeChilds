"use client";

// Tapping a situation starts the one incident on the device and goes to the safety check. If a case already exists, the
// tap asks first: starting a new case deletes the old one (steps, links, screenshots), and that never happens on a
// single tap (2026-10-12).

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";
import { emptyProfile, type SituationId } from "@safechilds/guidance";
import { incidentStore } from "../lib/incident-store";
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
      <div className="card card-danger start-confirm" role="group" aria-label={t("title")}>
        <div className="head">
          <Icon name="triangle-alert" />
          {t("title")}
        </div>
        <p className="small">{t("body")}</p>
        <div className="row2">
          <button className="btn btn-secondary" onClick={() => router.push("/plan")}>
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
          if (existing) {
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
