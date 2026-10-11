import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

// ≥ 768px: the app inside a phone frame with the QR + pitch beside it. This is the landing page.
// Below 768px it renders nothing extra (CSS in app/shell.css).
// The QR is a static public/qr.svg for the production URL with ?from=qr (bypasses the welcome). Regenerate: see ARCHITECTURE.md.
export async function DeviceShell({ children }: { children: ReactNode }) {
  const t = await getTranslations("shell");
  return (
    <div className="shell">
      <aside className="shell-aside" aria-label={t("aside")}>
        <div className="shell-brand">SafeChilds</div>
        <p className="shell-pitch">{t("pitch")}</p>
        <div className="shell-qr">
          <img className="shell-qr-img" src="/qr.svg" width={160} height={160} alt={t("qrAlt")} />
          <span className="small">{t("qr")}</span>
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
