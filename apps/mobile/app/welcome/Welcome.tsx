"use client";

// First open only: language + three one-line role steps. Skippable from step 1. The flag lives on the device.

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Icon } from "../../components/Icon";
import { meta } from "../../lib/incident-store";
import { setLocale } from "../../lib/set-locale";
import type { Locale } from "../../lib/locale";
import "./welcome.css";

export function Welcome({ initialLocale }: { initialLocale: Locale }) {
  const t = useTranslations("welcome");
  const router = useRouter();
  const slides = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [, startTransition] = useTransition();

  const width = () => slides.current?.clientWidth ?? 1;
  const goTo = useCallback((i: number) => slides.current?.scrollTo({ left: i * width(), behavior: "smooth" }), []);

  useEffect(() => {
    const el = slides.current;
    if (!el) return;
    // Plain state update: a rounded index changes at most once per slide, so there is nothing to throttle.
    const onScroll = () => setIndex(Math.round(el.scrollLeft / width()));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const finish = async () => {
    await meta.set({ welcomeSeen: true });
    router.replace("/");
  };

  const chooseLocale = (l: Locale) => {
    setLocaleState(l);
    startTransition(async () => {
      await setLocale(l);
      router.refresh();
    });
  };

  return (
    <>
      <header className="top">
        <span className="brand">SafeChilds</span>
        <button className="btn btn-quiet" style={{ width: "auto" }} onClick={finish}>{t("skip")}</button>
      </header>
      <main className="no-nav" style={{ gap: "var(--space-3)" }}>
        <div className="slides" ref={slides}>
          <section className="slide">
            <h1>{t("language.title")}</h1>
            <p className="sub">{t("language.sub")}</p>
            <div className="langpick">
              <button aria-pressed={locale === "tg"} onClick={() => chooseLocale("tg")}>Тоҷикӣ</button>
              <button aria-pressed={locale === "ru"} onClick={() => chooseLocale("ru")}>Русский</button>
            </div>
          </section>
          <section className="slide">
            <div className="mark"><Icon name="shield-alert" size={28} /></div>
            <h1>{t("role.title")}</h1>
            <p className="sub big">{t("role.sub")}</p>
          </section>
          <section className="slide">
            <div className="mark"><Icon name="lock" size={28} /></div>
            <h1>{t("trust.title")}</h1>
            <p className="sub big">{t("trust.sub")}</p>
          </section>
          <section className="slide">
            <div className="mark support"><Icon name="heart" size={28} /></div>
            <h1>{t("human.title")}</h1>
            <p className="sub big">{t("human.sub")}</p>
          </section>
        </div>
        <div className="foot">
          <div className="dots" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => <i key={i} className={i === index ? "on" : undefined} />)}
          </div>
          <button className="btn btn-primary" onClick={() => (index === 3 ? finish() : goTo(index + 1))}>
            {index === 3 ? t("start") : t("next")}
          </button>
        </div>
      </main>
    </>
  );
}
