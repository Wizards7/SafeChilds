# `apps/mobile` — PRD

**Status:** Draft 2026-10-09 — being edited live while the screens are discussed. Phases are hackathon phases (days), not product phases.

## The user

A teenager in Tajikistan who found a fake image, a fake video, an impersonating account, threats or harassment online. They open the app frightened, often alone, usually on an Android phone on mobile data. They may not want their parents to know. They need to understand what to do next and reach a real human — not to be told whether an image is "92% fake".

## Phase 0 — the spine (no demo without it)

| # | Screen | What it does | Decided |
|---|---|---|---|
| 0 | Language | First open: Тоҷикӣ / Русский. One tap, remembered on the device | yes |
| 1 | Home | "Something happened online?" + six situation buttons. If an incident exists, a "Continue" card on top | yes |
| 2 | Safety check | "Are you safe right now?" — four answers. Threat / not sure / urgent → Urgent screen, skipping everything else | yes — always the screen right after the situation |
| 3 | Urgent | Tell a trusted adult now + verified numbers only (empty state until a human on the team verified them) + directory urgent section | yes |
| 4 | Analyze | Offered, not forced, for fake photo / fake video. Upload → in-browser EXIF + C2PA → backend → result in one of four states, limitations always visible | yes — optional |
| 5 | Action plan | "Where did it happen?" (Instagram / TikTok / Telegram / VK) at the top, then steps for situation × platform with checkboxes | yes — platform picked here, not on Home |
| 6 | My Incident | The one local incident: type, platform, saved link, screenshots, done steps. "Start over" wipes it with confirmation | yes — one incident |

## Phase 1 — support (makes it human)

| # | Screen | What it does |
|---|---|---|
| 7 | Feelings | Eight answers including "I don't want to answer". Picks which support to offer. Never diagnoses |
| 8 | Breathe | One 60-second guided breathing. Skippable at any second. Offered only when feelings suggest it |
| 9 | People | Directory with filters: language, city, online / in person, works with teens. DEMO banner. Contact method per card. "Report inaccurate listing" |
| 10 | Privacy | Plain language: what we store (nothing), what we send (one image, deleted after), limits of confidentiality |

## Phase 2 — only if P0 + P1 are green on three phones by Sunday night

- Grounding exercise (5-4-3) as a second coping option
- Calm audio (licensed or original only)
- Sightengine score as an extra analysis signal (VERIFY free signup from Tajikistan)
- Install prompt tuning; guidance works offline after first open
- Parent / teacher entry on Home

## Cross-cutting from day one

- `ru` + `tg` on every screen; crisis copy in Tajik reviewed by a native before the demo
- Installable PWA; `theme-color` set; safe areas respected
- Bottom nav: Home · My Incident · Support · People. Analyze lives inside the journey, not in the nav
- Install prompt appears after the first completed plan step, never on first open

## Skipped, with the trigger that re-adds it

| Feature | Trigger |
|---|---|
| Accounts, OTP, consent flows | real referrals |
| Multiple incidents | pilot feedback |
| Video or URL analysis | a validated method exists |
| Incident export (PDF for a parent or police) | pilot feedback |
| Push notifications, follow-up reminders | native graduation |
| Any chat or "AI psychologist" | never |

## Open questions

- Which four platforms matter most for teens in Tajikistan — is VK still relevant, is Likee? Owner: floater, Friday.
- Does the teen pick a situation first or the safety check first for a user who arrives via the bot link? Current answer: situation, then safety, same as the app.
