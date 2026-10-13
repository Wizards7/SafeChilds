"use client";

// The store did not open (StorageUnavailable in lib/incident-store.ts): the case lives only on this phone and the browser
// is not giving it back right now. Never a blank screen: the "Помощь" pill stays in the header, retry reloads (a fresh
// open), Home works without the store. Same copy as the error boundary (app/error.tsx).

import { useTranslations } from "next-intl";
import { TopBar } from "./TopBar";

export function StoreFailed() {
  const t = useTranslations("error");
  return (
    <>
      <TopBar back={false} />
      <main className="no-nav" style={{ justifyContent: "center" }}>
        <h1>{t("title")}</h1>
        <p className="sub">{t("body")}</p>
        <div className="stack">
          <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>{t("retry")}</button>
          <a className="btn btn-secondary" href="/">{t("home")}</a>
        </div>
      </main>
    </>
  );
}
