# `packages/db`

Drizzle schema + migrations + seed. Consumed by `apps/backend` only. [`apps/backend/SCHEMA.md`](../../apps/backend/SCHEMA.md) is the source of truth; `src/schema.ts` implements it.

```
pnpm db:up                                   # root: Postgres on :5434
pnpm --filter @safechilds/db generate        # new migration from schema changes (commit it)
DATABASE_URL=... pnpm --filter @safechilds/db migrate
DATABASE_URL=... pnpm --filter @safechilds/db seed
```

Rules: every schema change goes through a committed migration (never `db push` to a shared DB); the seed is idempotent by slug; no table for incidents, evidence, images, users or device keys.
