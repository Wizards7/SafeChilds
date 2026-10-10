# `apps/backend` — PRD

**Status:** Draft 2026-10-09

## What it provides

Three public capabilities and one admin surface, nothing else.

| Capability | For | Procedure |
|---|---|---|
| Analyze one image and return an honest status | mobile | `analysis.run` |
| List professionals with filters, paginated | mobile, bot | `directory.list` |
| Report an inaccurate listing | mobile, bot | `reports.create` |
| Check a link — four honesty tiers, nothing stored | bot, mobile | `links.check` (saved 2026-10-10) |
| Manage the directory and read reports | crm | `directory.create` · `directory.update` · `directory.setStatus` · `reports.list` |

## Phase

Everything above is hackathon Phase 0 — the mobile spine needs `analysis.run` on Saturday and `directory.list` on Sunday; the CRM needs the admin procedures on Saturday for the floater to build against.

## Skipped, with the trigger that re-adds it

| Feature | Trigger |
|---|---|
| Referral requests to a professional | a partner organisation agrees to receive them |
| Incident storage of any kind | a trusted-adult shared view, if ever — and only after a legal review for minors' data |
| Sightengine as a second analysis signal | Phase 2, if the free signup works from Tajikistan |
| Webhooks, background jobs | first real integration; at that point the Fastify process already exists, nothing to extract |

## Open questions

- Rate limit for `analysis.run`: per IP is the only option without accounts. Number to be set after measuring one demo run (VERIFY on Monday, not guessed now).
- Admin auth: Better Auth plugin or the custom DB-session escape hatch — decided Saturday morning after a one-hour time-box.
