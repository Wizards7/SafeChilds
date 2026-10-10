# `apps/crm` — PRD

**Status:** Deferred 2026-10-10 — pilot plan, not a hackathon deliverable (see README). Added to the pilot scope from the 2026-10-10 discussion: working hours + "accepting requests" on each professional; a **Номера помощи** page for the verified urgent numbers; a **Запросы** inbox with two types (contact request, image-review request without the image — routing by category to a reviewer who contacts the kid in their own channel); a **Статистика** page of counts without PII.

## Why it exists

The directory is the project's local differentiator and it must be honest: every professional shown is either a clearly labelled demo row or verified by a human on a known date. That needs a place to record the verification and to act on "this listing is wrong" reports. That place is this app.

## Phase 0 (hackathon)

| Page | Does |
|---|---|
| Login | one admin, email + password, session issued by the backend |
| Professionals | list with status badges; add; edit; set `demo` / `unverified` / `verified` with `last_verified_at` |
| Reports | queue of listing reports with the professional they refer to; mark handled |

Built by the floater on Saturday against typed backend procedures; done Sunday.

## Skipped, with the trigger that re-adds it

| Feature | Trigger |
|---|---|
| Multiple admins and roles | a second person needs access in a pilot |
| Audit log of status changes | first `verified` row that is real — at that moment every change must be traceable |
| Referral inbox | partner organisation agrees to receive referrals |
| Any incident or analytics view | never for incidents; analytics counts only if a funder asks |

## Open questions

- Does the floater build this in Next.js (shared `packages/ui`) or is a plain server-rendered page faster for them? Decide Saturday morning based on who is actually building it.
