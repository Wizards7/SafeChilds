"use client";

// First open only: three beats, one illustration and one sentence each. Skip sits beside Next on every beat but
// the last, where Start stands alone (Skip and Start would do the same thing there). The flag
// lives on the device. Language is never a step: the server picks it from the phone (i18n/request.ts); the toggle
// lives on Home and in the top bar (removed from the welcome 2026-10-12 at Ali's call).

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { meta } from "../../lib/incident-store";
import { markSplashReady } from "../../lib/splash";
import "./welcome.css";

const BEATS = ["role", "trust", "human"] as const;
const ART = {
  role: { src: "/welcome/1.webp", w: 660, h: 667 },
  trust: { src: "/welcome/2.webp", w: 315, h: 667 },
  human: { src: "/welcome/3.webp", w: 660, h: 667 },
} as const;

export function Welcome() {
  const t = useTranslations("welcome");
  const router = useRouter();
  const slides = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const last = BEATS.length - 1;

  const width = () => slides.current?.clientWidth ?? 1;
  const goTo = useCallback(
    (i: number) => slides.current?.scrollTo({ left: i * width(), behavior: "smooth" }),
    [],
  );

  useEffect(() => {
    const el = slides.current;
    if (!el) return;
    // Plain state update: a rounded index changes at most once per slide, so there is nothing to throttle.
    const onScroll = () => setIndex(Math.round(el.scrollLeft / width()));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // The opening splash waits for this screen on a first open (WelcomeGate redirected under it).
  useEffect(() => {
    markSplashReady();
  }, []);

  const finish = async () => {
    await meta.set({ welcomeSeen: true });
    router.replace("/");
  };

  return (
    <>
      <main className="no-nav welcome">
        <div className="slides" ref={slides}>
          {BEATS.map((beat, i) => (
            <section key={beat} className={`slide${i === index ? " is-active" : ""}`}>
              <div className="scene">
                <img
                  className="art"
                  src={ART[beat].src}
                  width={ART[beat].w}
                  height={ART[beat].h}
                  alt=""
                  decoding="async"
                />
              </div>
              <div className="sheet">
                <h1>{t(`${beat}.title`)}</h1>
                <p>{t(`${beat}.sub`)}</p>
                <div className="dots" aria-hidden="true">
                  {BEATS.map((b, k) => (
                    <i key={b} className={k === index ? "on" : undefined} />
                  ))}
                </div>
                {i === last ? (
                  <button className="btn btn-primary" onClick={finish}>
                    {t("start")}
                  </button>
                ) : (
                  <div className="row">
                    <button className="btn btn-secondary" onClick={finish}>
                      {t("skip")}
                    </button>
                    <button className="btn btn-primary" onClick={() => goTo(i + 1)}>
                      {t("next")}
                    </button>
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
