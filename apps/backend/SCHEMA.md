# `apps/backend` — SCHEMA

The source of truth for persisted data and procedure contracts. `packages/db/src/schema.ts` implements the tables; the tRPC routers implement the procedures; both must match this file or this file is updated in the same commit.

## Tables (Postgres)

```
professionals
  id                    uuid pk
  name                  text
  role                  text            psychologist | counsellor | youth_org | school_psychologist | helpline
  credentials           text            free text, shown as given; never fabricated
  languages             text[]          tg | ru | en
  city                  text
  format                text            online | in_person | both
  adolescent_services   boolean
  verification_status   text            demo | unverified | verified
  last_verified_at      timestamptz null
  contact_method        text            how to reach them, as verified
  availability          jsonb null      weekday ranges in Asia/Dushanbe, e.g. {"mon":["14:00","19:00"]} (added 2026-10-10)
  accepting_requests    boolean         shown on the card; false hides the second path
  is_demo               boolean         true for every seeded row during the hackathon
  created_at, updated_at timestamptz

helplines                               (added 2026-10-10 — the Urgent screen reads this; nothing renders until verified_at is set)
  id               uuid pk
  name             text            ru + tg in a jsonb, or two columns
  number           text
  hours            text
  languages        text[]
  categories       text[]          which situations it fits (extortion, fraud, …)
  verified_by      text            team member who called
  verified_at      timestamptz null
  created_at       timestamptz

listing_reports
  id               uuid pk
  professional_id  uuid fk → professionals
  reason           text
  created_at       timestamptz

analysis_events
  id               uuid pk
  status           text       no_indicators | suspicious | inconclusive | unavailable
  indicator_codes  text[]     from the enum in packages/analysis
  created_at       timestamptz
```

Indexes: `professionals (verification_status, city)`, `professionals (created_at)` for cursor pagination, `listing_reports (professional_id)`, `analysis_events (created_at)`.

What is deliberately absent: users, sessions for the public, incidents, evidence, images, device keys. Admin sessions (Better Auth's own tables) arrive with the CRM.

Hackathon data path: `professionals` and `helplines` are filled by `packages/db/src/seed.ts` from `packages/directory` — the floater sends a verified number, it is committed, Railway redeploys. No admin UI.

**Specified, not built — `referrals` (saved 2026-10-10).** Goes live only when a partner organisation agrees to receive requests. Until then `referrals.create` runs in prototype mode: validates, returns a demo confirmation, persists nothing.

```
referrals
  id               uuid pk
  professional_id  uuid fk → professionals
  display_name     text              name or nickname, as the kid typed it
  contact_kind     text              phone | telegram
  contact_value    bytea             encrypted at rest; never logged, never hashed (a hash can't be called)
  language         text              tg | ru
  age_bracket      text              under_18 | 18_24   — never a birth date
  format           text              online | in_person
  preferred_time   text null
  proxy_contact    bytea null        a trusted adult's contact instead, encrypted
  consent_at       timestamptz
  status           text              pending | received | expired
  expires_at       timestamptz       7 days from creation; deleted on `received` or expiry, whichever first
  created_at       timestamptz
```

No incident data, no evidence, no situation text travels with a request.

## Procedures (tRPC)

**Public**

| Procedure | Input | Output | Notes |
|---|---|---|---|
| `POST /analysis` (plain multipart route, not tRPC — a file is the wrong fit for JSON transport; implemented 2026-10-10) | `image` (jpeg/png/webp ≤ 8 MB) + `evidence` (JSON array of local facts the phone established) | `{ tier, markers: [{code,x,y}], evidence: string[], originalMatches: boolean }` | rate-limited 10/min per IP; image held in memory for the request only; writes one `analysis_events` row (tier + codes); without `ANTHROPIC_API_KEY` the tier is `unavailable` unless local evidence raises it |
| `directory.list` | `{ lang?, city?, format?, cursor?, limit? }` | `{ items: Professional[], nextCursor: string \| null }` | cursor pagination by `created_at, id`; every item carries `isDemo` and `verificationStatus` |
| `reports.create` | `{ professionalId, reason }` | `{ ok: true }` | rate-limited per IP |
| `links.check` | `{ url }` | `{ tier, findings: Finding[], finalUrl, nextSteps: string[] }` | rate-limited per IP; nothing stored; backend follows redirects with HEAD; rules in `packages/analysis` (saved 2026-10-10) |
| `referrals.create` | the request fields above | `{ mode: "prototype" \| "live", requestId? }` | **prototype mode in the hackathon: validates and persists nothing.** Live mode behind the partner trigger; rate-limited per IP |
| `reviews.create` | `{ category, situation, platform, tier, indicatorCodes, answers, contact (as in referrals) }` — **never the image** | same prototype/live shape as `referrals.create` | the "спросить человека" ticket; the reviewer contacts the kid in their own channel and sees the image there, once. Specified 2026-10-10, prototype in the hackathon |

**Admin — deferred with the CRM (2026-10-10); specified, not built**

| Procedure | Input | Output |
|---|---|---|
| `directory.create` | Professional without id/timestamps | `Professional` |
| `directory.update` | `{ id, ...partial }` | `Professional` |
| `directory.setStatus` | `{ id, verificationStatus, lastVerifiedAt? }` | `Professional` |
| `reports.list` | `{ cursor?, limit? }` | `{ items: ListingReport[], nextCursor }` |

All inputs are Zod schemas shared with the CRM forms so one schema validates the API and renders the field errors.

## Enums owned elsewhere

Statuses and indicator codes: `packages/analysis`. Professional roles, formats, verification states: `packages/directory`. This file names them for readers; the packages are the source.
