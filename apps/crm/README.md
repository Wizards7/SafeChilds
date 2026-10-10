# `apps/crm` — directory admin

**Status: deferred (decided 2026-10-10).** Not built for the hackathon: the directory is seed data, the helpline numbers are a seed file the floater fills after calling, and requests ship as a labelled prototype, so nobody would open a CRM on demo day. Two sketch frames on the design board tell the "how a human verifies" story instead. **Re-add trigger:** the first real professional to verify, or a partner organisation that sends requests. The spec below stays as the pilot plan; the data it needs (`availability`, `helplines`, `referrals`, `review_requests`) is already in `apps/backend/SCHEMA.md` so the CRM becomes a UI over existing tables.

The back office for exactly one thing: the professional directory. Add a professional, set their verification status, see reports of inaccurate listings. Separate app, separate subdomain, its own login — never a route inside the product.

## Documentation

| File | Owns |
|---|---|
| [`PRD.md`](./PRD.md) | scope — directory admin only, and why nothing else |
| [`DESIGN.md`](./DESIGN.md) | the three pages, laptop-first with a phone fallback |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Next.js shape, auth via backend, env, deployment |
| [`RULES.md`](./RULES.md) | invariants — verification honesty, no incident data |

Contracts come from `apps/backend` ([`SCHEMA.md`](../backend/SCHEMA.md)); this app owns no schema.

## What this app does NOT do

- Show incidents, analyses, users or anything about a teenager. None of that exists on the server.
- Hold a database connection. Every write goes through the backend's admin procedures.
- Edit verification status without a human having checked. The status field is a statement of fact, not a toggle.
