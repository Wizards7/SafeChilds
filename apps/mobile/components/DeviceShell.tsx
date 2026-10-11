import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

// ≥ 768px: the app inside a phone frame with the QR + pitch beside it. This is the landing page.
// Below 768px it renders nothing extra (CSS in app/shell.css).
// The QR is a static public/qr.svg for the production URL with ?from=qr (bypasses the welcome); the text under it
// shows this deployment's own origin. Regenerate: see ARCHITECTURE.md.
export async function DeviceShell({ children }: { children: ReactNode }) {
  const t = await getTranslations("shell");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return (
    <div className="shell">
      <aside className="shell-aside" aria-label={t("aside")}>
        <div className="shell-brand">SafeChilds</div>
        <p className="shell-pitch">{t("pitch")}</p>
        <div className="shell-qr">
          <img className="shell-qr-img" src="/qr.svg" width={128} height={128} alt={t("qrAlt")} />
          <div className="shell-qr-text">
            <span className="small">{t("qr")}</span>
            <code className="shell-url">{appUrl}</code>
          </div>
        </div>
        <ul className="shell-honest">
          <li>{t("real")}</li>
          <li>{t("prototype")}</li>
          <li>{t("next")}</li>
        </ul>
      </aside>
      <div className="shell-frame">
        <div className="shell-screen">{children}</div>
      </div>
    </div>
  );
}
