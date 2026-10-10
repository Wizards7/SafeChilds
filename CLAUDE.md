# SafeChilds

AI-assisted online safety and human support for teenagers in Tajikistan (UNICEF hackathon, case 05, 14–16 Oct 2026). One mobile-first PWA, one Fastify + tRPC backend, one Telegram bot. The product helps a kid take the next safe step and reach a real human; it does not claim to detect fakes.

**Authority on any conflict:** [`docs/plans/0001-hackathon-scope.md`](./docs/plans/0001-hackathon-scope.md). Then each app's spec files. Then this map.

**Status (2026-10-10):** specs written, all 16 screens sketched on the design board, scaffold in progress. Order: root → packages → backend → mobile → bot → Railway.

## Layout

```
apps/
  backend/   Fastify + tRPC. The only app with DATABASE_URL. Public procedures only for the hackathon.
  mobile/    Next.js PWA — the product. No API routes, no DB. IndexedDB holds the one incident.
  bot/       grammY. Second entrance to the same guidance. No uploads, no storage.
  crm/       DEFERRED — spec kept, see apps/crm/README.md.
packages/
  config/    tsconfig base, prettier.
  ui/        tokens.css + app.css promoted from the sketches, Inter woff2, icon sprite.
  guidance/  situations, questions, plan items with showWhen, ru + tg strings. Plain TS, no framework deps.
  analysis/  evidence/indicator enums, decideTier(), link tiers, explanation templates. Plain TS, unit-tested.
  directory/ Professional + Helpline types, demo seed, helplines seed.
  db/        Drizzle schema + migrations + seed. Backend only.
docs/plans/  numbered decisions. docs/structure/ folder guide.
assets/      gitignored design staging: assets/design/mobile/*.html sketches, canvas/gen.py → the board.
```

Each app has README / PRD / DESIGN / ARCHITECTURE / RULES / SCHEMA where they apply. Read the spec before touching the app.

## Rules that are specific to this project

- No child data on the server: no incidents, no evidence, no images, no device keys. The analyzed image lives in memory for one request. A review or contact request never carries an image.
- The analysis tier is decided by `packages/analysis` rules from evidence + indicator codes. The model returns codes only; it never picks a tier, never writes user-facing text, never outputs a number. No percentages, no "authentic", no "safe".
- A screen shows only what the situation profile matches (`showWhen`). The floating help button is the one exception.
- Safety check is always the screen after the situation. Threat / unsure / urgent go straight to `/urgent`. No phone number renders until a human verified it (`helplines.verified_at`).
- Every user-visible string exists in `ru` and `tg`; AI-written Tajik carries `VERIFY` until a native reviewed it.
- Identity is never asked at the door; only as an expiring contact request at the moment of contacting a professional.
- Demo directory rows are `is_demo = true` and labelled on screen.

## Stack (locked for the hackathon)

pnpm 9 + Turborepo · TypeScript strict · Next.js (App Router) + next-intl · Fastify 5 + tRPC 11 + Zod · Postgres 16 + Drizzle · Vitest · plain CSS from the sketches (no Tailwind for the hackathon; re-add trigger: a second app needs a shared component library) · Railway.

## Commands

```
corepack pnpm install
pnpm db:up            # Postgres on :5434
pnpm typecheck | lint | test | build
pnpm --filter @safechilds/backend dev
pnpm --filter @safechilds/mobile dev
python3 assets/design/mobile/canvas/gen.py   # regenerate the design board
```

## Working style

Plan → "go" → execute → commit. Discussion first on architecture. No guessed data in files (VERIFY instead). Surgical edits. Commit after each completed piece, typecheck green before commit. Report in chat, end with decided vs pending.
