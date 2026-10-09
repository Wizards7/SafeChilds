# `apps/mobile` — ARCHITECTURE

## Decisions locked (2026-10-09)

- **Next.js App Router, mobile-first, installable PWA.** Native deferred; re-add trigger: a pilot that needs push alerts or on-device secure storage.
- **No API routes in this app.** The backend is `apps/backend` (Fastify + tRPC); this app holds a tRPC client and nothing else server-side.
- **No accounts.** An anonymous `incidentKey` is generated on the device and lives in IndexedDB. It never appears in a URL.
- **Evidence is local-first.** Links, screenshots, notes and checked steps live in IndexedDB. The only bytes that leave the phone are the one image sent for analysis, and the backend discards it after the response.
- **In-browser checks before any upload:** EXIF presence and a C2PA manifest check with the `c2pa` WASM library. These run even when the backend is unreachable.
- **i18n with `next-intl`**, `ru` + `tg`, locale remembered on the device. Every user-visible string, including errors, goes through messages.
- **Desktop shell:** at ≥ 768px the app renders in a phone frame with the QR beside it. It is a CSS media query and one component, not a second app.

## Route structure

```
app/
  layout.tsx            html lang, theme-color, fonts, DeviceShell, BottomNav, error boundary
  language/             first-open language pick
  page.tsx              home
  situation/[type]/     fake-photo | fake-video | impersonation | threats | harassment | unknown
  safety/
  urgent/
  analyze/
  feelings/
  breathe/
  plan/
  incident/
  people/
  privacy/
components/             DeviceShell, BottomNav, ResultCard, StepChecklist, SafetyBanner, DemoBanner
lib/
  incident-store.ts     IndexedDB access — the one incident
  client-checks.ts      EXIF + C2PA
  trpc.ts               tRPC client + TanStack Query provider
messages/ru.json, tg.json
public/manifest.json, icons/, qr.svg
```

## Environment

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | backend origin for the tRPC client |
| `NEXT_PUBLIC_APP_URL` | the app's own origin, used to generate the QR in the desktop shell |

No secrets exist in this app. Anything prefixed `NEXT_PUBLIC_` ships to every visitor.

## Deployment

Railway service `mobile` at the root domain. The backend is on `api.<domain>`; its CORS allowlist includes this origin. Build: `next build`; the service runs `next start`.

## Testing

Hackathon scope: typecheck + lint in CI from the first commit of this app; unit tests live in `packages/analysis` (the status rules), not here. Manual verification on three real phones (one iPhone, two Android) is the definition of done for every screen. Playwright journeys are a pilot-phase re-add.
