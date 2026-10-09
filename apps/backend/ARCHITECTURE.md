# `apps/backend` — ARCHITECTURE

## Decisions locked (2026-10-09)

- **Fastify standalone + `@trpc/server` Fastify adapter.** Shape B from the plan: one API, three typed clients. Copied from the RentTimeReal P0 pipeline, not rebuilt.
- **PostgreSQL + Drizzle** through `packages/db`. Schema changes are committed migration files.
- **Two procedure builders, `public` and `admin`, defined once** in `trpc/procedures.ts`. No router hand-rolls an auth check.
- **Admin auth: Better Auth**, email + password, one admin seeded from env, DB-backed session in an httpOnly cookie on this app's domain. Escape hatch if the setup exceeds one hour: custom DB-backed session, ~200 lines.
- **Image handling:** multipart in, validated for type and size on the server, passed to `packages/analysis`, discarded. Never written to disk, never logged.
- **Health:** `healthz` always 200; `readyz` checks the database only. Third-party reachability (Anthropic) is never a readiness condition.

## Modules

```
src/
  server.ts               boot: env (Zod, crash on missing), CORS allowlist, rate limit, multipart, health
  trpc/
    context.ts            db, client ip, admin session if the cookie is present
    procedures.ts         public · admin
    router.ts             merges modules; exports AppRouter
  modules/
    analysis/             router.ts · service.ts
    directory/            router.ts · service.ts
    reports/              router.ts · service.ts
  auth/
    admin.ts              Better Auth config + seed
```

A module exposes its router and its service. Services talk to `packages/db`; routers talk to services. Nothing else crosses a module boundary.

## Environment

| Var | Purpose |
|---|---|
| `DATABASE_URL` | Postgres (Railway) |
| `ANTHROPIC_API_KEY` | analysis model |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` | the single seeded admin |
| `CORS_ORIGINS` | comma-separated: mobile origin, crm origin |
| `PORT` | Railway sets it |

All validated at boot. A missing variable is a crash with a clear message, not a runtime surprise.

## Deployment

Railway service `backend` at `api.<domain>`, with the Railway Postgres attached. Migrations run as a release step before the process starts. Long-poll bot and the CRM reach it over HTTPS; nothing is exposed except the tRPC endpoint and the two health routes.

## Testing

`fastify.inject` integration tests for the three public procedures and the admin gate (an unauthenticated call to an admin procedure must fail). Unit tests for the status rules live in `packages/analysis`. CI runs typecheck + lint + tests from the first commit of this app.
