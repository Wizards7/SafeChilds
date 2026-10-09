# `apps/backend` — the API

One Fastify process with tRPC. The only app that holds `DATABASE_URL` and the only importer of `packages/db`. Three clients talk to it: the mobile PWA (public procedures), the CRM (admin procedures), the Telegram bot (public procedures).

## Documentation

| File | Owns |
|---|---|
| [`PRD.md`](./PRD.md) | what the API provides for the hackathon and what it deliberately does not |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | modules, procedures, auth posture, env, deployment |
| [`RULES.md`](./RULES.md) | invariants — images never stored, no PII, public/admin only |
| [`SCHEMA.md`](./SCHEMA.md) | the three tables and the procedure contracts |

## What this app does NOT do

- Store images. The analyzed image lives in memory for one request and is discarded.
- Store incidents, users, device keys or anything that identifies a teenager.
- Serve HTML. Every client is its own app.
- Run as microservices. One process, module folders, clear boundaries.
