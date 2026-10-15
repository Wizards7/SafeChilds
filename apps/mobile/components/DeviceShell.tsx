import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

// ≥ 768px: the app inside a phone frame with the landing content beside it. This is the landing page.
// Below 768px it renders nothing extra (CSS in app/shell.css).
// The QR is a static public/qr.svg for the production URL with ?from=qr (bypasses the welcome). Regenerate: see ARCHITECTURE.md.
// Layout from Ali's landing mockup (2026-10-15): the phone left; his headline with the product promise under it; the
// teen + adult picture beside the QR (a CSS background in app/shell.css, so phones and narrow windows never download it);
// three true benefit chips; the image-check line and the prototype note.

// Chip icons are official Lucide paths (file-text, user-check, smartphone, info; lucide-static 1.57.0) inlined here
// instead of added to the sprite: this panel exists only on laptops, and a sprite change would bump the service worker
// and make every phone re-download its offline cache.
const CHIPS = [
  {
    key: "plan",
    tone: "",
    icon: (
      <>
        <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
        <path d="M14 2v5a1 1 0 0 0 1 1h5" />
        <path d="M10 9H8" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
      </>
    ),
  },
  {
    key: "noReg",
    tone: " support",
    icon: (
      <>
        <path d="m16 11 2 2 4-4" />
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
      </>
    ),
  },
  {
    key: "onPhone",
    tone: "",
    icon: (
      <>
        <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
        <path d="M12 18h.01" />
      </>
    ),
  },
] as const;

export async function DeviceShell({ children }: { children: ReactNode }) {
  const t = await getTranslations("shell");
  return (
    <div className="shell">
      <div className="shell-frame">
        <div className="shell-screen">{children}</div>
      </div>
      <aside className="shell-aside" aria-label={t("aside")}>
        <div className="shell-brand">
          <img src="/icon.svg" width={40} height={40} alt="" />
          <span>SafeChilds</span>
        </div>
        <div className="shell-head">
          <h2>{t("headline")}</h2>
          <p>{t("pitch")}</p>
        </div>
        <div className="shell-media">
          <div className="shell-art" aria-hidden="true" />
          <div className="shell-qr">
            <img className="shell-qr-img" src="/qr.svg" width={168} height={168} alt={t("qrAlt")} />
            <b>{t("qr")}</b>
            <span>{t("qrHint")}</span>
          </div>
        </div>
        <ul className="shell-chips">
          {CHIPS.map(({ key, tone, icon }) => (
            <li key={key}>
              <span className={`ic${tone}`}>
                <svg viewBox="0 0 24 24" width={22} height={22} aria-hidden="true">
                  {icon}
                </svg>
              </span>
              <span>{t(`chips.${key}`)}</span>
            </li>
          ))}
        </ul>
        <p className="shell-fine">{t("fine")}</p>
        <div className="shell-note">
          <svg viewBox="0 0 24 24" width={22} height={22} aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <div>
            <b>{t("protoTitle")}</b>
            <span>{t("proto")}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
