import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

// ≥ 768px: the app inside a phone frame with the QR + pitch beside it. This is the landing page.
// Below 768px it renders nothing extra (CSS in app/shell.css).
// The QR is a static public/qr.svg for the production URL with ?from=qr (bypasses the welcome). Regenerate: see ARCHITECTURE.md.
// Look (Ali's pick, 2026-10-15: direction A of the desktop-shell sketch): the app's light Calm Trust surface, the shield
// mark, and the three honesty lines as labelled rows readable on a projector.

// The row icons are official Lucide paths (circle-check, flask-conical, arrow-right, lucide-static 1.57.0) inlined here
// instead of added to the sprite: this panel exists only on laptops, and a sprite change would bump the service worker
// and make every phone re-download its offline cache.
const HONEST = [
  {
    key: "real",
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
  },
  {
    key: "prototype",
    icon: (
      <>
        <path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2" />
        <path d="M6.453 15h11.094" />
        <path d="M8.5 2h7" />
      </>
    ),
  },
  {
    key: "next",
    icon: (
      <>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </>
    ),
  },
] as const;

export async function DeviceShell({ children }: { children: ReactNode }) {
  const t = await getTranslations("shell");
  return (
    <div className="shell">
      <aside className="shell-aside" aria-label={t("aside")}>
        <div className="shell-brand">
          <img src="/icon.svg" width={36} height={36} alt="" />
          <span>SafeChilds</span>
        </div>
        <p className="shell-pitch">{t("pitch")}</p>
        <div className="shell-qr">
          <img className="shell-qr-img" src="/qr.svg" width={168} height={168} alt={t("qrAlt")} />
          <span>{t("qr")}</span>
        </div>
        <ul className="shell-honest">
          {HONEST.map(({ key, icon }) => (
            <li key={key}>
              <span className="ic">
                <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden="true">
                  {icon}
                </svg>
              </span>
              <div>
                <b>{t(`${key}Title`)}</b>
                <p>{t(key)}</p>
              </div>
            </li>
          ))}
        </ul>
      </aside>
      <div className="shell-frame">
        <div className="shell-screen">{children}</div>
      </div>
    </div>
  );
}
