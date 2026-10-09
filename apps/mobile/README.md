# `apps/mobile` — the product (mobile-first PWA)

The app a teenager opens when something happened online. One journey: what happened → are you safe → optional image check → optional coping → action plan → a real person → my incident. Mobile is the only viewport that matters; on a laptop the same app renders inside a phone frame with a QR beside it, which is also the hackathon landing page.

## Documentation

| File | Owns |
|---|---|
| [`PRD.md`](./PRD.md) | scope by phase — what ships for the hackathon, what waits |
| [`DESIGN.md`](./DESIGN.md) | screens, journey graph, design workflow, tokens pointer |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | routes, components, env, deployment, testing |
| [`RULES.md`](./RULES.md) | invariants — safety, privacy, honesty, PWA |
| [`SCHEMA.md`](./SCHEMA.md) | the on-device incident record + the backend contracts this app consumes |

The authority on scope conflicts is [`docs/plans/0001-hackathon-scope.md`](../../docs/plans/0001-hackathon-scope.md).

## What this app does NOT do

- No accounts, no login, no OTP. An anonymous key on the device is the only identity.
- No database access. Everything server-side goes through `apps/backend` over tRPC.
- No storage of incidents on the server. Evidence stays in IndexedDB on the phone.
- No "AI psychologist", no chat, no diagnosis.
- No admin surface. The directory is managed in `apps/crm`.
