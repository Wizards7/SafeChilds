# `apps/crm` — ARCHITECTURE

## Decisions locked (2026-10-09)

- **Next.js, separate app, separate Railway service** at `admin.<domain>`. Never a `/admin` route in `apps/mobile`.
- **No database access.** A tRPC client against `apps/backend` admin procedures; the backend's `AppRouter` type gives every form its contract.
- **Auth lives in the backend.** The login page posts to the backend's Better Auth endpoint; the session cookie is issued on the backend domain; the CRM sends credentials with each tRPC call. If cross-subdomain cookies fight the time-box, the fallback is a bearer session token held in memory for the tab — never in localStorage.
- **Forms:** React Hook Form + Zod with the backend's schemas; server errors map back to their fields.

## Route structure

```
app/
  layout.tsx
  login/
  professionals/          list
  professionals/new/
  professionals/[id]/     edit + verification section
  reports/
lib/trpc.ts
```

## Environment

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | backend origin |

No secrets in this app.

## Deployment

Railway service `crm`, `next build` + `next start`. Backend CORS allowlist includes this origin. Nothing in this app is reachable without a session except the login page.

## Testing

Typecheck + lint in CI. The admin gate is tested in the backend (`fastify.inject`), which is where it is enforced; this app's protection is cosmetic by design.
