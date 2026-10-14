# Folder structure guide

Every folder in the repo gets an entry the day it is created: what it is for, what goes in, what does not. Four bullets max, "Do NOT put here" is the valuable one.

## Top level

### `.claude/`
- **Purpose:** project-level Claude Code configuration, committed
- **Contains:** `settings.local.json` (allowed commands); `skills/` for project slash-commands when a repeated workflow appears
- **Do NOT put here:** global rules (those live in `~/.claude/`); secrets

### `.github/`
- **Purpose:** CI gates and templates
- **Contains:** `workflows/secret-scan.yml`, `workflows/docs-integrity.yml`, `workflows/checks.yml`; PR and issue templates; `README.md` listing deferred pipelines with triggers
- **Do NOT put here:** deploy logic (Railway's GitHub integration handles it); secrets

### `apps/`
- **Purpose:** what ships to a user; one folder per deployable
- **Contains:** `backend/`, `mobile/`, `bot/`, `crm/` (deferred), `website/` (placeholder)
- **Do NOT put here:** shared code (that's `packages/`); an app importing another app

### `assets/` (gitignored)
- **Purpose:** local staging for design drafts and media, same lifecycle as RentTimeReal
- **Contains:** `design/design-system/` (tokens, foundation sheet), `design/mobile/` (one HTML sketch per screen + `canvas/gen.py` → the design board), `design/research/`, `mobile/` and `crm/` icon/logo/image staging
- **Do NOT put here:** anything that must be in git — approved tokens and CSS are promoted to `packages/ui/`, icons to `apps/<app>/public/`

### `docs/`
- **Purpose:** cross-cutting documentation only
- **Contains:** `plans/` (numbered decisions; highest number wins), `structure/` (this guide)
- **Do NOT put here:** app specs (they live in the app: README / PRD / DESIGN / ARCHITECTURE / RULES / SCHEMA); package specs (in the package README)

### `packages/`
- **Purpose:** shared code; one folder = one responsibility
- **Contains:** `config/`, `ui/`, `guidance/`, `analysis/`, `directory/`, `db/`
- **Do NOT put here:** `utils/` or `common/`; anything only one app uses

### `scripts/`
- **Purpose:** repo-level one-off tools run by a person, never by an app
- **Contains:** `tajik-review.ts` (collects every AI-written Tajik string next to its Russian source into `docs/tajik-review.{csv,md}` for the native speaker; run with `pnpm --filter @safechilds/backend exec tsx ../../scripts/tajik-review.ts`)
- **Do NOT put here:** anything an app imports; build or deploy steps (those live in each app's `package.json` and Dockerfile)

## `apps/`

### `apps/backend/`
- **Purpose:** the API — Fastify + tRPC, the only process with `DATABASE_URL`
- **Contains:** `src/server.ts`, `src/trpc/`, `src/modules/{analysis,directory,reports,links}/`, tests
- **Do NOT put here:** HTML; image storage of any kind; admin auth until the CRM returns

### `apps/mobile/`
- **Purpose:** the product, a Next.js PWA
- **Contains:** `app/` routes per screen, `components/`, `lib/` (incident store, client checks, tRPC client), `messages/{ru,tg}.json`, `public/` (manifest, icons)
- **Do NOT put here:** API routes; DB access; guidance text (that's `packages/guidance`)

### `apps/bot/`
- **Purpose:** Telegram second entrance
- **Contains:** `src/bot.ts`, `src/flows/`, `src/i18n.ts`, `src/trpc.ts`
- **Do NOT put here:** file downloads; any storage; copy that differs from the app

### `apps/crm/`
- **Purpose:** deferred directory admin (spec only)
- **Contains:** spec files
- **Do NOT put here:** code before the re-add trigger fires (first real professional, or a partner sending requests)

### `apps/website/`
- **Purpose:** placeholder so collaborators see where the website will live (2026-10-14)
- **Contains:** `README.md` only; no `package.json`, so no build and no deploy
- **Do NOT put here:** a built site before plan 0001's Surface decision is reopened in writing

## `packages/`

### `packages/config/`
- **Purpose:** shared tool configuration
- **Contains:** `tsconfig.base.json`
- **Do NOT put here:** runtime code

### `packages/ui/`
- **Purpose:** design tokens and the app stylesheet promoted from the sketches; fonts; icon sprite
- **Contains:** `tokens.css`, `app.css`, `fonts/`, `icons.svg`
- **Do NOT put here:** React components with business logic; per-screen styles (those stay in the app)

### `packages/guidance/`
- **Purpose:** the content engine — situations, questions, plan items with `showWhen`, `ru` + `tg` strings
- **Contains:** `src/profile.ts`, `src/showWhen.ts`, `src/items/`, `src/i18n/`
- **Do NOT put here:** Next.js or DB imports; a string that exists in only one language

### `packages/analysis/`
- **Purpose:** the honesty contract — tiers from evidence and codes, link tiers, explanation templates
- **Contains:** `src/evidence.ts`, `src/indicators.ts`, `src/rules.ts` (+ tests), `src/links.ts`, `src/templates/`, `src/prompt.ts`
- **Do NOT put here:** anything that stores an image or a URL; a percentage

### `packages/directory/`
- **Purpose:** Professional and Helpline types; demo and helpline seeds
- **Contains:** `src/types.ts`, `src/seed.professionals.ts`, `src/seed.helplines.ts`
- **Do NOT put here:** real contact details before a human verified them with a date

### `packages/db/`
- **Purpose:** Drizzle schema, migrations, seed script
- **Contains:** `src/schema.ts`, `src/client.ts`, `src/seed.ts`, `migrations/`
- **Do NOT put here:** tables for incidents, evidence, images, users, device keys
