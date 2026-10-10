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
  is_demo               boolean         true for every seeded row during the hackathon
  created_at, updated_at timestamptz

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

What is deliberately absent: users, sessions for the public, incidents, evidence, images, device keys. Admin sessions are Better Auth's own tables.

## Procedures (tRPC)

**Public**

| Procedure | Input | Output | Notes |
|---|---|---|---|
| `analysis.run` | multipart image, max size and allowed types enforced server-side | `{ status, indicatorCodes: string[], limitations: string[] }` | rate-limited per IP; writes one `analysis_events` row |
| `directory.list` | `{ lang?, city?, format?, cursor?, limit? }` | `{ items: Professional[], nextCursor: string \| null }` | cursor pagination by `created_at, id`; every item carries `isDemo` and `verificationStatus` |
| `reports.create` | `{ professionalId, reason }` | `{ ok: true }` | rate-limited per IP |
| `links.check` | `{ url }` | `{ tier, findings: Finding[], finalUrl, nextSteps: string[] }` | rate-limited per IP; nothing stored; backend follows redirects with HEAD; rules in `packages/analysis` (saved 2026-10-10) |

**Admin**

| Procedure | Input | Output |
|---|---|---|
| `directory.create` | Professional without id/timestamps | `Professional` |
| `directory.update` | `{ id, ...partial }` | `Professional` |
| `directory.setStatus` | `{ id, verificationStatus, lastVerifiedAt? }` | `Professional` |
| `reports.list` | `{ cursor?, limit? }` | `{ items: ListingReport[], nextCursor }` |

All inputs are Zod schemas shared with the CRM forms so one schema validates the API and renders the field errors.

## Enums owned elsewhere

Statuses and indicator codes: `packages/analysis`. Professional roles, formats, verification states: `packages/directory`. This file names them for readers; the packages are the source.
