"use client";

import { useTranslations } from "next-intl";

// A broken screen shows a fallback with a way out, not a dead app. The help button and nav stay mounted in the layout.
export default function ErrorScreen({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations("error");
  return (
    <main className="no-nav" style={{ justifyContent: "center" }}>
      <h1>{t("title")}</h1>
      <p className="sub">{t("body")}</p>
      <div className="stack">
        <button className="btn btn-primary" onClick={reset}>{t("retry")}</button>
        <a className="btn btn-secondary" href="/">{t("home")}</a>
      </div>
    </main>
  );
}
