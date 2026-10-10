# `packages/analysis` — the honesty contract

Plain TypeScript, no dependency on Next.js or the database. Consumed by `apps/backend` (model call + rules) and `apps/mobile` (local checks, result rendering, explanation templates). The rules here decide what a teenager is told about an image; nothing elsewhere may override them.

## What it owns

- **Evidence types** — the verifiable facts the client or server can establish without a model: `c2pa_manifest` (present, and what it declares), `exif_present`, `exif_contradiction` (software tag, dimensions, dates), `original_differs`, `original_matches`.
- **Indicator codes** — the fixed enum the model may return: a closed list such as `face_boundary`, `lighting_mismatch`, `hands_or_fingers`, `text_or_logo_artifacts`, `background_warp`, `skin_too_smooth`. Final list fixed when the prompt is written; anything outside the enum is a validation failure, not a new code.
- **Rules** — `(evidence[], codes[]) → tier`, pure and unit-tested. The model adds markers; it never raises a tier.
- **Prompt + Zod response schema** — the model returns codes with marker positions and nothing else: no free text, no numbers, no verdict.
- **Explanation templates** (`ru`, `tg`) keyed by tier and code: what it is, how to check it yourself, what it means for the next step.

## Tiers

| Tier | Rule |
|---|---|
| `evidence` — Есть доказательства изменения | at least one verifiable evidence item: C2PA declares generated/edited, EXIF contradicts itself, or the image differs from the kid's own original |
| `indicators` — Есть признаки возможной подделки | no evidence item, at least one model code |
| `inconclusive` — Не удалось определить | no evidence, no codes |
| `unavailable` — Проверка недоступна | model call failed or the file was rejected; local checks still reported |

`original_matches` is not a tier. It is a finding that routes to the non-consensual-use plan: the photo is real and misused.

## Rules that never change

- No percentages, no confidence values, no "authentic", no "definitely fake". "No indicators" never means "real".
- The tier is a function of evidence and codes only. The client cannot set it; the model cannot set it.
- A "where to look" item exists only for an evidence item or a returned code. No generic padding to look thorough.
- Model markers are labelled *возможно*; evidence items are labelled *факт*.
- Every explanation ends with the next step, never with a verdict.
- The image is not stored by anything in this package or by its callers.

## Links (saved 2026-10-10)

The same contract on a different input. `checkLink(url)` owns:

- **Deterministic checks**: final URL after redirects (the backend fetches with HEAD, never in a user's session); lookalike comparison against a short list of brands teens in Tajikistan actually use (banks, Instagram, Telegram, TikTok — list VERIFY with the floater); domain registration age via RDAP; shortener detection; page asks for a code or payment (from the URL and title only).
- **Blocklist lookups**: Google Safe Browsing, URLhaus — VERIFY free access and limits; each is one evidence source, timeout-wrapped, failure = `unavailable` for that source only.
- **Tiers**: `known_dangerous` (blocklist hit) → `signs` (deterministic findings) → `nothing_known` ("это не значит, что безопасно") → `unavailable`.
- **Templates** (`ru`, `tg`): each finding as "what it is + где смотреть + what it means for the next step".

Nothing about a checked URL is stored.

## What is deliberately not here

- A second detection vendor (Sightengine). Re-add trigger: Phase 2 of the hackathon if the free signup works from Tajikistan; at that point this package wraps both behind one `signals()` call and the rules gain one evidence source.
- Video or URL analysis. Re-add trigger: a validated method.
- Any human review queue. Re-add trigger: a partner organisation that receives cases, with consent and legal review — it means storing minors' images, which the product does not do today.
