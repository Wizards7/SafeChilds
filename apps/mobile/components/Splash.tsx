"use client";

// The opening logo splash (RULES.md, 2026-10-12): covers the window between the first paint and the moment the first
// screen is in place (hydrated, welcome decided, the incident store answered). It sits in the server HTML, first inside
// the shell, so it paints with the first frame; the mark is a copy of public/icon.svg so no fetch stands between the
// frame and the logo. Mounted once per document load in the root layout: never between screens, never on a tab return.
// Hide = 200 ms fade (none with reduced motion), then display:none + inert. The node stays in the DOM and React never
// re-renders it, so hydration cannot trip over the classes the script below adds.
// Before React runs, the inline script owns two paths: a 3 s cap that reveals the page whatever happens (the
// server-rendered page is tappable before the JS arrives, and the cap is a maximum, not a delay), and a failed script
// load, which turns the overlay into the error with a retry. The strings are rendered here, hidden, so the error needs
// no JS bundle to be readable. The script is a static constant, never user content.

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { incidentStore } from "../lib/incident-store";
import { markSplashReady, onSplashReady } from "../lib/splash";

const CAP_MS = 3000;
const FADE_MS = 200;

const BOOT = `(function(){var cap;function el(){return document.getElementById('sc-splash')}
function hide(){clearTimeout(cap);var s=el();if(!s||s.classList.contains('is-hidden'))return;s.classList.remove('is-error');s.classList.add('is-hidden');setTimeout(function(){s.classList.add('is-gone');s.setAttribute('inert','')},${FADE_MS + 50})}
function fail(){var s=el();if(!s||s.classList.contains('is-hidden'))return;clearTimeout(cap);s.classList.add('is-error');s.removeAttribute('aria-hidden');var b=s.querySelector('button');if(b){b.onclick=function(){location.reload()};b.focus()}}
cap=setTimeout(hide,${CAP_MS});
window.addEventListener('error',function(e){var t=e.target;if(t&&t.tagName==='SCRIPT')fail()},true);
window.__scSplash={hide:hide,fail:fail}})();`;

export function Splash() {
  const t = useTranslations("splash");
  const path = usePathname();

  useEffect(() => {
    // Home: the welcome gate owns the signal (stay → ready; first open → Welcome marks ready when it mounts).
    // Everywhere else: ready once the store answered, which is when the screens stop returning null.
    if (path !== "/") void incidentStore.get().then(markSplashReady, markSplashReady);
    return onSplashReady(() => window.__scSplash?.hide());
  }, [path]);

  return (
    <>
      <div id="sc-splash" className="splash" aria-hidden="true">
        <svg className="splash-mark" viewBox="0 0 512 512" width="96" height="96" aria-hidden="true">
          <rect width="512" height="512" rx="112" fill="#2563eb" />
          <path d="M256 96c-40 32-96 48-152 48v120c0 88 60 152 152 184 92-32 152-96 152-184V144c-56 0-112-16-152-48z" fill="none" stroke="#fff" strokeWidth="28" strokeLinejoin="round" />
          <path d="M196 264l40 40 80-88" fill="none" stroke="#fff" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="splash-error" role="alert">
          <p id="sc-splash-msg">{t("error")}</p>
          <button type="button" className="btn btn-primary" aria-describedby="sc-splash-msg">{t("retry")}</button>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      <noscript>
        <style>{"#sc-splash{display:none}"}</style>
      </noscript>
    </>
  );
}
