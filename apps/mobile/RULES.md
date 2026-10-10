# `apps/mobile` — RULES

Invariants. A change that breaks one of these is wrong even if it works.

## Safety first

- The safety check is always the screen right after the situation. No analysis, no exercise, no plan before it.
- "Someone is threatening me", "I'm not sure I'm safe", "I need urgent help", and the situations blackmail and shared private content route straight to `/urgent`. Nothing is offered on the way.
- The app never says a human is watching, never says it can guarantee safety, never shows a phone number a team member has not personally verified.
- A teen choosing "stop for now" is never treated as "safe now". No nagging, no repeated prompts.

## Honesty about analysis

- The analysis status comes from `packages/analysis` rules, never from the model and never from the client.
- No percentages, no confidence values, no "authentic", no "definitely fake". Four states only, limitations always visible next to the result.
- "No suspicious indicators" never uses green. Green is for completed steps only.
- Analysis is optional and skippable. Every other screen works when analysis fails or is skipped.

## Privacy for minors

- Nothing about an incident is sent to the server. The incident key, links, screenshots, notes and steps live in IndexedDB only.
- Before upload the screen says: do not upload intimate images of yourself or anyone else; the file is deleted after the result.
- Only the one image being analyzed leaves the phone. It is not stored anywhere.
- No analytics SDK, no third-party scripts, no cookies. Nothing identifies the device beyond its own IndexedDB.
- "Start over" wipes the incident after a confirmation. Deletion is a real delete.

## Copy

- Every string exists in `ru` and `tg`, including error messages. Hardcoded user-facing text is a bug.
- Crisis and safety copy in Tajik is reviewed by a native speaker before it ships. Until then it is marked `VERIFY` in `messages/tg.json`.
- No victim-blaming, no promises of removal, no legal advice, no "AI therapist" language. Warm and direct: "Что-то случилось?", not "Сообщить об инциденте".

## PWA and phone realities

- Mobile layout is the base; the desktop shell is a wrapper. `dvh`, never `100vh`. Safe areas on every fixed bar.
- Touch targets 44px minimum. No hover-only interaction. Pressed states on every button.
- Slow network and offline are designed states on every screen that calls the backend. Guidance content never needs the network after first load.
- The install prompt appears after the first completed plan step, never on first open.
- The welcome is shown once, skippable from its first step, bypassed by deep links, and never again — "Start over" wipes the incident, not the welcome flag. No splash of our own; the manifest splash is the only one.
- A screen shows only what the situation profile matches. Showing a step, tool or category the profile didn't select is a bug, not extra help. The floating help button is the one exception.
- Zoom is never disabled.
