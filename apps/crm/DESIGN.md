# `apps/crm` — DESIGN

## Who uses it and where

One team member, on a laptop, for a few minutes at a time. Laptop is the primary viewport; it still has to be usable on a phone because verification calls happen from a phone. Same tokens as the product (`packages/ui`), no separate brand.

## Pages

**Login** — one field pair, errors under the fields, nothing else.

**Professionals** — a table on laptop, a card list on phone. Columns: name, role, city, languages, format, status badge, last verified. Status badge colours follow the semantic tokens: `demo` neutral, `unverified` warning, `verified` success. Row tap opens the edit form. Primary action: Add professional.

**Professional form** — every field from `apps/backend/SCHEMA.md`, validated by the shared Zod schema so each field shows its own error. The verification section is separate and deliberate: a status select, a date, and a required note "how was this verified". Saving `verified` without a note is blocked.

**Reports** — list newest first: professional name, reason, date, Mark handled. Empty state says so.

## Workflow

Same as the product: HTML sketch in `assets/design/crm/` for the professionals page only (the other pages are forms), opened once on a laptop and once on a phone, then built.

## Open design questions

- None that block Saturday. The floater may simplify freely as long as the field errors stay per-field and the verification note stays required.
