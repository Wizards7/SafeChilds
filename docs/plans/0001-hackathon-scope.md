# 0001 — Hackathon scope, decisions, team, schedule, demo

**Status:** Approved 2026-10-09
**Event:** Regional AI Hackathon for child online safety — UNICEF Tajikistan with the Agency for Innovation and Digital Technologies, a side event of Dushanbe Invest 2026, **14–16 October 2026**. The build happens before the 14th; the event is the demo and the pitch.
**Case:** 05 — "Выглядит как настоящее, но это не так". A teenager whose image or identity was used to make fake content. The case rewards helping the victim, not detecting the fake.
**Team and product name:** SafeChilds.

This document wins over the original ChatGPT brief and over any app spec where they differ. The brief describes a two-month product; this describes the five-day version that can be demonstrated honestly.

## 1. The promise

We don't detect fakes. We help a teenager take the next safe step and reach a real human. Analysis is one optional step in a journey; the journey is the product.

## 2. Decisions

| Decision | Choice | Why | Re-open trigger |
|---|---|---|---|
| Surface | One mobile-first installable **PWA** (Next.js). On a laptop it renders inside a phone frame with a QR and the pitch line beside it — that is the landing page | Judges scan a QR and it opens in seconds; installed it is indistinguishable from native; no Expo Go, no store, no two platforms in five days. A separate website would be a fifth deploy nobody opens after the event | Push alerts or on-device secure storage at pilot → Expo. SEO or a parents/schools page at pilot → website |
| Backend | **`apps/backend`: Fastify + tRPC**, one Postgres, the only app that touches the DB | One typed API, three clients; the public/admin procedure split is defined once. Copied from the RentTimeReal P0 pipeline, costs half a day on Saturday | — (this is the playbook lock; nothing to re-open) |
| Accounts | **None at the door.** An anonymous key on the device. Identity is asked once, at the moment of contacting a professional, as an **expiring encrypted contact request** (name or nickname, one contact, language, age bracket) — never a full name, never a birth date, never an account (saved 2026-10-10) | Users are minors; a database of identified victims is the most dangerous table a small team can own; data minimisation is the pitch. A professional needs a way to reach the kid, not an identity | Live requests when a partner organisation receives them; in-app chat only with on-duty professionals + safeguarding protocol + legal review |
| Evidence | **Local-first**, IndexedDB on the phone. The server stores no incident data of any kind | Nothing sensitive sits in our database; the only bytes that leave the phone are one image for analysis, discarded after the response | A trusted-adult shared view, after a legal review for minors' data |
| Analysis | Four tiers decided by code rules in `packages/analysis`: verifiable evidence (C2PA, metadata contradictions, differs from the kid's own original) → model indicators as *возможно* markers → inconclusive → unavailable. Every result shows **where to look**. Human check is a hand-off to a verified organisation, never our own queue (saved 2026-10-10, detail in `apps/mobile/PRD.md`) | Honest by construction: the model never picks a tier, never writes user-facing text, never outputs a number; the kid can verify every claim with their own eyes | A validated detector with a published evaluation on manipulated faces; a partner organisation that receives review cases |
| Directory | **Demo data**, every row `is_demo = true`, banner on screen | No verified professionals by the 14th; inventing them is forbidden | First row a human verifies → `verified` with a date |
| Languages | **Russian + Tajik** in the app; English only in the pitch | The team can write and review both; crisis copy in Tajik gets a native review before the demo | Kazakh / Uzbek at regional expansion |
| Design | Palette "Calm Trust" with the fixes in `assets/design/design-system/tokens.css`; **light only**; Inter self-hosted, Tajik glyphs verified | Neutrals dominate, blue is protection, teal is human support, red is urgency only. No AI accent colour | Dark theme if pilot analytics show heavy night use |
| Hosting | **Railway**: Postgres + backend + mobile + bot (crm deferred 2026-10-10) | Account exists, GitHub deploy, nothing to provision | Pilot with real minors' data → data-residency review (Закон №1537 — VERIFY applicability) |
| Monorepo | pnpm workspaces + Turborepo; `apps/` never import each other; `packages/` one responsibility each | Guidance content and directory types are shared by three apps; one source or the demo contradicts itself on stage | — |

## 3. Scope

The spine is one journey: language → home → category → situation → safety → (analyze) → (feelings → breathe) → plan → people → incident. Home carries four of the organizers' six threat categories — поддельный контент, вымогательство, мошенничество, кибербуллинг — each with 2–3 concrete situations; content per category follows their four-question scheme (что это · как выглядит · почему ребёнок молчит · что помогает). Per-app scope by phase lives in each app's `PRD.md`; the cut across the whole product is:

**MUST** — the mobile spine (P0) and support screens (P1), the backend's four public procedures (analysis, directory, reports, link check) with seeded directory and helplines, the bot's situation → safety → plan → people flow, installable PWA, `ru` + `tg`, a working end-to-end demo on three real phones.

**NICE** — day 4 only if MUST is green: "pop the anxious thoughts" (`/thoughts`), `/lock` on "Мой случай", three SVG spot scenes for the welcome, Sightengine as a second signal (VERIFY free signup from Tajikistan), offline guidance. Parent / teacher "browse everything" is out (2026-10-10) — pilot.

**SKIP, with triggers** — accounts (never as a door; expiring contact request instead), live referral requests (partner organisation; the form ships as a labelled prototype), in-app chat with a professional (partner + safeguarding protocol + legal review; remote help is a hand-off to Telegram or phone), video/URL analysis (validated method), incident export (pilot feedback), push (native), admin beyond the directory (never for incidents), any chat or "AI psychologist" (never).

## 4. Architecture

```
apps/
  backend/   Fastify + tRPC — analysis · directory · reports · links modules; public procedures only; only DB access
  mobile/    Next.js PWA — the product; tRPC client; IndexedDB incident store; desktop shell = landing
  crm/       DEFERRED 2026-10-10 — spec kept; trigger: first real professional or a partner sending requests
  bot/       grammY — second entrance: situation → safety → plan → people → link to app; no uploads
packages/
  guidance/  situations, safety answers, feelings, plans per situation × platform, exercises; ru + tg strings
  directory/ Professional type, verification states, demo seed
  analysis/  indicator enum, signal → status rules (unit-tested), Claude prompt + Zod schema, explanation templates
  db/        Drizzle schema (3 tables) + migrations; one pooled client
  ui/        tokens, fonts, shadcn base components
```

`guidance` and `analysis` have no dependency on Next.js or the database — that is what lets the bot reuse them and the rules be tested in seconds. Details: each app's `ARCHITECTURE.md`; data and procedures: `apps/backend/SCHEMA.md`.

Deliberately absent: `infra/` (Railway, until a VPS), `e2e/` (Playwright at pilot), `packages/integrations/` (one vendor in one file; re-add when Sightengine joins), `packages/types/` (never), a website (the desktop shell).

## 5. Safety routing

"Someone is threatening me", "I'm not sure I'm safe", "I need urgent help", and the situations blackmail and shared private content bypass exercises and the plan and open the urgent screen: tell a trusted adult now, plus the directory's urgent section. Phone numbers appear only once a team member has called and verified them; until then the screen says local numbers are being confirmed. The app never claims a human is watching and never claims it can guarantee safety.

## 6. Team

| Person | Owns | Blocked on |
|---|---|---|
| Ali | `apps/mobile`, `apps/backend`, `packages/*`, design, DB schema | — |
| Person 2 | guidance content with the floater (ru), then testing on three phones (CRM deferred 2026-10-10) | `packages/guidance` vocabulary from Ali, Friday |
| Person 3 | `apps/bot` | `packages/guidance` strings, Friday |
| Person 4 (floater) | guidance copy ru → tg, per-platform report paths, demo directory data, testing on three phones, pitch deck, helpline VERIFY | — |

Design came first (Thursday) because three people were blocked on it.

## 7. Schedule

| Day | Ali | Person 2 (content) | Bot | Floater |
|---|---|---|---|---|
| Thu 9 | Repo, specs, tokens + foundation sheet — done | Read specs | BotFather, grammY hello-world | Collect report paths for Instagram / TikTok / Telegram / VK; draft ru guidance copy |
| Fri 10 | HTML sketches of the screens with state switchers, on a real phone; scaffold monorepo + backend skeleton | Fake content + extortion plans (ru) with the floater | Conversation tree against `packages/guidance` | Finish guidance JSON (ru); demo directory dataset; call the helpline |
| Sat 11 | Backend: four public procedures + seeds; mobile: home, situation, safety, analyze end to end | Fraud + cyberbullying plans (ru); learn-the-signs cards | Safety check + plan + people | Tajik translation pass |
| Sun 12 | Mobile: urgent, feelings, breathe, plan, people, incident | Test every journey on three phones; file bugs | Link to app, urgent path | Test on three phones; Figma import of approved sketches |
| Mon 13 | PWA install + offline + i18n polish; deploy; install on the demo phone | Deploy | Deploy | Run the demo script five times; fix what breaks |
| Tue 14 | Rehearsal in the morning. Nothing new ships | Pitch deck | — | — |

Nothing new after Sunday night. Monday is polish and deploy.

## 7a. Build phases (approved 2026-10-10)

Root, packages and backend are built, tested, pushed; CI is green. Each phase below ends green (typecheck + tests), verified in a browser at 375px, committed and pushed. Nothing new after Sunday night.

| Phase | What | Done when |
|---|---|---|
| M0 app shell | Next.js + next-intl (locale on the device, no URL prefixes), `packages/ui` CSS, layout with nav + help + desktop shell, error boundary, IndexedDB incident store, tRPC client, `/welcome`, first Home | welcome → Home works in both languages |
| M1 demo spine | `/`, `/situation`, `/safety`, `/urgent`, `/question`, `/stop`, `/plan` composed from `packages/guidance`, `/incident` | fake-photo and extortion journeys click through with no backend; steps persist |
| M2 tools | `/analyze` (exifr + c2pa in the browser, compare with the original, `POST /analysis`, four tiers + markers + где смотреть), `/link` | works against the local backend; `unavailable` tier correct with the backend stopped |
| M3 people + support | `/people`, `/request` (prototype), `/feelings`, `/breathe`, `/privacy` | all 16 routes exist and match the board |
| M4 PWA | manifest, serwist precache, offline states, install prompt after the first plan step, `?from=` deep links, i18n sweep | installs on a phone; guidance works in airplane mode |
| B bot skeleton | grammY boot, `/start` with language + situations, tRPC client | `/start` answers in Telegram; flows handed to the bot person |
| R Railway | Postgres + backend + mobile + bot, env, migrations as release step, seeds, domain, QR | the public URL opens on a phone over mobile data |
| D demo | content merged, Tajik reviewed, demo image, five rehearsals on three phones | the script runs clean twice in a row |

Small library picks taken without a separate decision: `exifr` (EXIF), `idb` (IndexedDB). Two VERIFYs failed on install and were replaced (2026-10-10): the official `c2pa` package needs WASM + worker assets wired through the bundler — the client detects Content Credentials *presence* only (`c2pa_present_unverified`), validation is a pilot item; `@serwist/next` is a webpack plugin and the app builds with Turbopack — the service worker is hand-written (`apps/mobile/public/sw.js`: shell precache + route chunks, cache-first static, network-first navigation with `/offline`). The embedded Browser pane cannot run service workers, so the worker is **verified on a real phone or desktop Chrome**, not in the pane — a Monday checklist item.

**Demo image (decided 2026-10-10):** a team member's own photo, edited by that team member, with their consent. Never a stranger's photo, never a generated face presented as a person. One version with metadata stripped and visible indicators for the model path; the untouched original on the demo phone for the compare path.

## 8. Demo (three minutes)

Laptop on the projector shows the app inside the phone frame with the QR beside it; the journey is clicked through there.

1. Home → "Someone created a fake photo of me".
2. Safety: "Yes, I'm safe". Feelings: "Anxious". Breathing, skipped after ten seconds to show it is optional.
3. Analyze the prepared demo image → "suspicious indicators — this is not proof", limitations visible.
4. Plan for a fake photo on Instagram: save the link, screenshot, don't reply, report with the exact taps, restrict, tell a trusted adult. Two steps ticked.
5. People → directory with the DEMO banner, filtered Tajik + online.
6. My Incident: the steps done.
7. Real phone mirrored for twenty seconds: the installed app, no browser bars.
8. Second phone: the Telegram bot does situation → safety → plan in twenty seconds.
9. Close: "We don't detect fakes. We help the kid take the next safe step and reach a real human."

One slide lists what is real, what is prototype, what is next.

## 9. VERIFY before it reaches a screen

| Item | Owner | By |
|---|---|---|
| Tajikistan child helpline: exists, number, hours, languages — a team member calls it | floater | Fri |
| Current in-app report paths for Instagram, TikTok, Telegram, VK | floater | Fri |
| Which platforms teens in Tajikistan actually use (VK? Likee?) | floater | Fri |
| Every Tajik string written by AI — native review | floater | Sat |
| Sightengine free signup from Tajikistan | Ali | Sun, only if NICE is reached |
| Anthropic API data policy text at the time of the pitch | Ali | Mon |
| Take It Down (NCMEC) works from Tajikistan; participating platforms today | Ali | Fri |
| Google Safe Browsing + URLhaus free access and limits for `links.check` | Ali | Sat |
| Bank hotline numbers for "уже отправил(а)": Alif, Eskhata, Амонатбанк, Душанбе Сити | floater | Fri |
| School psychologists in Tajik schools — how common, how a teen reaches one | floater | Sat |
| An organisation in Tajikistan that can look at evidence of a fake (the "ask a real person" hand-off) | floater | Fri |
| grammY conversation plugin fits the inline-keyboard tree | bot | Thu |
| Better Auth setup within a one-hour time-box, else the custom session fallback | Ali | Sat |
