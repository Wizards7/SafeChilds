"use client";

// Guided breathing (redesigned 2026-10-14, Ali): in for 4 seconds, out for 6, six breaths in one minute. One clock
// drives both the ring (a CSS animation, which stays smooth on a busy cheap phone) and the words inside it («Вдох» /
// «Выдох» and a 4-3-2-1 count), so they cannot drift: the timer counts time only while running, and the ring pauses
// with it (animation-play-state). Pause / continue at any second; «Закончить» ends on the done screen, a pause, not an
// exit. Reduced motion: the ring does not grow, it brightens and dims, and the words carry the rhythm. Vibration at
// each switch only where the phone can (navigator.vibrate; iPhones cannot), off by default, remembered on this phone.
// Leaving goes back where the kid came from: to Поддержка when they came from there (?from=feelings) or have no case
// (/plan would bounce a kid without a case to Home), to the plan otherwise. A minute ended with «Закончить» or run to
// the end, after at least 30 seconds, is logged in the case (incident.breaths) for the Поддержка tab's count; leaving by
// the back arrow is not a finish and logs nothing.

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Icon } from "../../components/Icon";
import { TopBar } from "../../components/TopBar";
import { incidentStore } from "../../lib/incident-store";
import { useIncident } from "../../lib/use-incident";
import "./breathe.css";

const TOTAL_MS = 60_000;
const IN_S = 4;
const OUT_S = 6;
const CYCLE_S = IN_S + OUT_S;
const LOG_FROM_MS = 30_000;
const VIBRATE_KEY = "sc-vibrate"; // a UI preference, nothing about the kid

const noop = () => () => undefined;
// Desktop Chrome has navigator.vibrate too and does nothing with it: the switch is for touch phones that can buzz.
const useCanVibrate = () => useSyncExternalStore(noop, () => typeof navigator.vibrate === "function" && window.matchMedia("(pointer: coarse)").matches, () => false);

// The count on Поддержка is a convenience: if the phone's storage refuses, this minute is simply not counted and the
// screen goes on as usual.
function logBreath(hasCase: boolean, ms: number) {
  if (ms >= LOG_FROM_MS && hasCase) incidentStore.addBreath(Math.round(ms / 1000)).catch(() => undefined);
}

function phaseAt(ms: number): { inhale: boolean; count: number } {
  const t = (ms / 1000) % CYCLE_S;
  const inhale = t < IN_S;
  return { inhale, count: Math.max(1, Math.ceil(inhale ? IN_S - t : CYCLE_S - t)) };
}

export default function BreathePage() {
  const t = useTranslations("breathe");
  const { incident } = useIncident();
  const canVibrate = useCanVibrate();
  const [mode, setMode] = useState<"idle" | "running" | "paused" | "done">("idle");
  const [elapsed, setElapsed] = useState(0);
  const [run, setRun] = useState(0); // a new run restarts the ring's animation from its first frame
  const [fromFeelings, setFromFeelings] = useState(false);
  const [vibrate, setVibrate] = useState(false);
  const clock = useRef({ acc: 0, since: 0, inhale: true });

  // Read once on the client: where this visit came from (?from=feelings) and the vibration preference.
  useEffect(() => {
    setFromFeelings(new URLSearchParams(window.location.search).get("from") === "feelings");
    try {
      setVibrate(window.localStorage.getItem(VIBRATE_KEY) === "1");
    } catch {
      setVibrate(false); // storage blocked (private mode): the switch simply starts off
    }
  }, []);
  const back = fromFeelings || !incident ? "/feelings" : "/plan";
  const hasCase = !!incident;

  // The one clock. It ticks only while running; a switch between in and out may buzz.
  useEffect(() => {
    if (mode !== "running") return;
    const id = setInterval(() => {
      const ms = clock.current.acc + Date.now() - clock.current.since;
      if (ms >= TOTAL_MS) {
        clearInterval(id);
        setElapsed(TOTAL_MS);
        setMode("done");
        logBreath(hasCase, TOTAL_MS);
        return;
      }
      const { inhale } = phaseAt(ms);
      if (inhale !== clock.current.inhale) {
        clock.current.inhale = inhale;
        if (vibrate && canVibrate) navigator.vibrate(40);
      }
      setElapsed(ms);
    }, 200);
    return () => clearInterval(id); // a re-created interval keeps the time: it lives in `clock`, not in the closure
  }, [mode, vibrate, canVibrate, hasCase]);

  // A hidden page is not breathing time: locking the phone or switching apps pauses the minute, and the ring with it, so
  // it can neither finish nor be logged unseen (review, 2026-10-14). The kid goes on with the play button.
  useEffect(() => {
    if (mode !== "running") return;
    const onHide = () => {
      if (!document.hidden) return;
      clock.current.acc += Date.now() - clock.current.since;
      setElapsed(clock.current.acc);
      setMode("paused");
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [mode]);

  const start = () => {
    clock.current = { acc: 0, since: Date.now(), inhale: true };
    setElapsed(0);
    setRun((r) => r + 1);
    setMode("running");
  };
  const pause = () => {
    clock.current.acc += Date.now() - clock.current.since;
    setElapsed(clock.current.acc);
    setMode("paused");
  };
  const resume = () => {
    clock.current.since = Date.now();
    setMode("running");
  };
  const finish = () => {
    const ms = Math.min(TOTAL_MS, mode === "running" ? clock.current.acc + Date.now() - clock.current.since : clock.current.acc);
    setElapsed(ms);
    setMode("done");
    logBreath(hasCase, ms);
  };
  const toggleVibrate = (on: boolean) => {
    setVibrate(on);
    try {
      window.localStorage.setItem(VIBRATE_KEY, on ? "1" : "0");
    } catch {
      // storage blocked: the switch still works for this visit
    }
  };

  const { inhale, count } = phaseAt(elapsed);
  const left = Math.max(0, Math.ceil((TOTAL_MS - elapsed) / 1000));
  const leftText = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
  const progress = Math.min(100, (elapsed / TOTAL_MS) * 100);
  const live = mode === "running" || mode === "paused";

  return (
    <>
      <TopBar title="" backHref={back} />
      <main className="no-nav breathe-page">
        {/* Mounted from the start, so a screen reader announces even the first «Вдох» */}
        <span className="sr-only" aria-live="polite">{live ? (inhale ? t("inhale") : t("exhale")) : ""}</span>
        {mode === "idle" && (
          <>
            <h1>{t("title")}</h1>
            <p className="sub">{t("sub")}</p>
            <div className="br-ring"><span className="outer" /><span className="inner" /><span className="label"><span className="phase">{t("ready")}</span></span></div>
            <div className="cta">
              <button type="button" className="btn btn-support" onClick={start}>{t("start")}</button>
              <Link className="btn btn-quiet" href={back}>{t("skip")}</Link>
            </div>
          </>
        )}

        {live && (
          <>
            <div key={run} className={`br-ring is-running${mode === "paused" ? " is-paused" : ""}`} aria-hidden="true">
              <span className="outer" />
              <span className="inner" />
              <span className="label">
                <span className="phase">{inhale ? t("inhale") : t("exhale")}</span>
                <span className="count">{count}</span>
              </span>
            </div>
            <p className="sub">{t("slow")}</p>
            <div className="br-time">
              <span className="left" aria-hidden="true">{leftText}</span>
              <span className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={60} aria-valuenow={60 - left} aria-valuetext={leftText} aria-label={t("timeLeft")}><span style={{ width: `${progress}%` }} /></span>
            </div>
            <button type="button" className="br-toggle" onClick={mode === "running" ? pause : resume} aria-label={mode === "running" ? t("pause") : t("resume")}>
              <Icon name={mode === "running" ? "pause" : "play"} size={28} />
            </button>
            <div className="cta">
              <button type="button" className="btn btn-quiet" onClick={finish}>{t("finish")}</button>
              {canVibrate && (
                <label className="br-vib">
                  <span>{t("vibration")}</span>
                  <input type="checkbox" role="switch" checked={vibrate} onChange={(e) => toggleVibrate(e.target.checked)} />
                </label>
              )}
            </div>
          </>
        )}

        {mode === "done" && (
          <>
            <div className="br-ring"><span className="outer" /><span className="inner" /><span className="label"><Icon name="check" size={40} className="i done-check" /></span></div>
            <h2>{t("doneTitle")}</h2>
            <p className="sub">{incident ? t("doneBody") : t("doneBodyNoCase")}</p>
            <div className="cta">
              <Link className="btn btn-primary" href={incident ? "/plan" : "/"}>{t("next")}</Link>
              <button type="button" className="btn btn-secondary" onClick={start}>{t("again")}</button>
              <Link className="btn btn-quiet" href="/people">{t("person")}</Link>
            </div>
          </>
        )}
      </main>
    </>
  );
}
