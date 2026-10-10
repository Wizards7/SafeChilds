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
| Accounts | **None.** An anonymous key on the device | Users are minors; signup, OTP and consent are a week of work and a liability. Data minimisation becomes a pitch point | Real referrals |
| Evidence | **Local-first**, IndexedDB on the phone. The server stores no incident data of any kind | Nothing sensitive sits in our database; the only bytes that leave the phone are one image for analysis, discarded after the response | A trusted-adult shared view, after a legal review for minors' data |
| Analysis | Four tiers decided by code rules in `packages/analysis`: verifiable evidence (C2PA, metadata contradictions, differs from the kid's own original) → model indicators as *возможно* markers → inconclusive → unavailable. Every result shows **where to look**. Human check is a hand-off to a verified organisation, never our own queue (saved 2026-10-10, detail in `apps/mobile/PRD.md`) | Honest by construction: the model never picks a tier, never writes user-facing text, never outputs a number; the kid can verify every claim with their own eyes | A validated detector with a published evaluation on manipulated faces; a partner organisation that receives review cases |
| Directory | **Demo data**, every row `is_demo = true`, banner on screen | No verified professionals by the 14th; inventing them is forbidden | First row a human verifies → `verified` with a date |
| Languages | **Russian + Tajik** in the app; English only in the pitch | The team can write and review both; crisis copy in Tajik gets a native review before the demo | Kazakh / Uzbek at regional expansion |
| Design | Palette "Calm Trust" with the fixes in `assets/design/design-system/tokens.css`; **light only**; Inter self-hosted, Tajik glyphs verified | Neutrals dominate, blue is protection, teal is human support, red is urgency only. No AI accent colour | Dark theme if pilot analytics show heavy night use |
| Hosting | **Railway**: Postgres + backend + mobile + crm + bot | Account exists, GitHub deploy, nothing to provision | Pilot with real minors' data → data-residency review (Закон №1537 — VERIFY applicability) |
| Monorepo | pnpm workspaces + Turborepo; `apps/` never import each other; `packages/` one responsibility each | Guidance content and directory types are shared by three apps; one source or the demo contradicts itself on stage | — |

## 3. Scope

The spine is one journey: language → home → category → situation → safety → (analyze) → (feelings → breathe) → plan → people → incident. Home carries four of the organizers' six threat categories — поддельный контент, вымогательство, мошенничество, кибербуллинг — each with 2–3 concrete situations; content per category follows their four-question scheme (что это · как выглядит · почему ребёнок молчит · что помогает). Per-app scope by phase lives in each app's `PRD.md`; the cut across the whole product is:

**MUST** — the mobile spine (P0) and support screens (P1), the backend's three public procedures and four admin procedures, the CRM's three pages, the bot's situation → safety → plan → people flow, installable PWA, `ru` + `tg`, a working end-to-end demo on three real phones.

**NICE** — day 4 only if MUST is green: grounding exercise, calm audio, Sightengine as a second signal (VERIFY free signup from Tajikistan), offline guidance, parent/teacher entry.

**SKIP, with triggers** — accounts (real referrals), referral requests (partner organisation), video/URL analysis (validated method), incident export (pilot feedback), push (native), admin beyond the directory (never for incidents), any chat or "AI psychologist" (never).

## 4. Architecture

```
apps/
  backend/   Fastify + tRPC — analysis · directory · reports modules; admin auth; only DB access
  mobile/    Next.js PWA — the product; tRPC client; IndexedDB incident store; desktop shell = landing
  crm/       Next.js — directory admin only; own login; admin.<domain>
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
| Person 2 | `apps/crm` UI on Ali's schema | backend admin procedures, Saturday |
| Person 3 | `apps/bot` | `packages/guidance` strings, Friday |
| Person 4 (floater) | guidance copy ru → tg, per-platform report paths, demo directory data, testing on three phones, pitch deck, helpline VERIFY | — |

Design came first (Thursday) because three people were blocked on it.

## 7. Schedule

| Day | Ali | CRM | Bot | Floater |
|---|---|---|---|---|
| Thu 9 | Repo, specs, tokens + foundation sheet — done | Read specs | BotFather, grammY hello-world | Collect report paths for Instagram / TikTok / Telegram / VK; draft ru guidance copy |
| Fri 10 | HTML sketches of the screens with state switchers, on a real phone; scaffold monorepo + backend skeleton | Read `apps/crm/*` | Conversation tree against `packages/guidance` | Finish guidance JSON (ru); demo directory dataset; call the helpline |
| Sat 11 | Backend: three public procedures + admin; mobile: home, situation, safety, analyze end to end | CRM pages on typed procedures | Safety check + plan + people | Tajik translation pass |
| Sun 12 | Mobile: urgent, feelings, breathe, plan, people, incident | CRM done | Link to app, urgent path | Test on three phones; Figma import of approved sketches |
| Mon 13 | PWA install + offline + i18n polish; deploy; install on the demo phone | Deploy | Deploy | Run the demo script five times; fix what breaks |
| Tue 14 | Rehearsal in the morning. Nothing new ships | Pitch deck | — | — |

Nothing new after Sunday night. Monday is polish and deploy.

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
