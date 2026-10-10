"use client";

// 60 seconds. The ring grows (inhale) and shrinks (exhale) on an 8-second cycle. Skippable at any second. No nav.
// Ends with a door back to the plan: a pause, not an exit.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Icon } from "../../components/Icon";
import { TopBar } from "../../components/TopBar";
import "./breathe.css";

const TOTAL = 60;

export default function BreathePage() {
  const t = useTranslations("breathe");
  const router = useRouter();
  const [state, setState] = useState<"idle" | "running" | "done">("idle");
  const [left, setLeft] = useState(TOTAL);

  useEffect(() => {
    if (state !== "running") return;
    const id = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          setState("done");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [state]);

  const phase = Math.floor((TOTAL - left) / 4) % 2 === 0 ? t("inhale") : t("exhale");
  const mmss = `0:${String(left).padStart(2, "0")}`;

  return (
    <>
      <TopBar title="" backHref="/plan" />
      <main className="no-nav breathe-page">
        {state === "idle" && (
          <>
            <h1>{t("title")}</h1>
            <p className="sub">{t("sub")}</p>
            <div className="breath"><div className="ring"><span>{t("ready")}</span></div></div>
            <div className="cta">
              <button className="btn btn-support" onClick={() => { setLeft(TOTAL); setState("running"); }}>{t("start")}</button>
              <Link className="btn btn-quiet" href="/plan">{t("skip")}</Link>
            </div>
          </>
        )}
        {state === "running" && (
          <>
            <div className="timer" aria-live="off">{mmss}</div>
            <div className="breath is-running"><div className="ring"><span aria-live="polite">{phase}</span></div></div>
            <p className="sub">{t("slow")}</p>
            <div className="cta"><button className="btn btn-quiet" onClick={() => router.push("/plan")}>{t("stop")}</button></div>
          </>
        )}
        {state === "done" && (
          <>
            <div className="breath"><div className="ring"><Icon name="check" size={40} className="i done-check" /></div></div>
            <h2>{t("doneTitle")}</h2>
            <p className="sub">{t("doneBody")}</p>
            <div className="cta">
              <Link className="btn btn-primary" href="/plan">{t("next")}</Link>
              <button className="btn btn-secondary" onClick={() => { setLeft(TOTAL); setState("running"); }}>{t("again")}</button>
              <Link className="btn btn-quiet" href="/people">{t("person")}</Link>
            </div>
          </>
        )}
      </main>
    </>
  );
}
