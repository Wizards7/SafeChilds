# `apps/bot` — Telegram second entrance

The same guidance as the app, for the teenager who will not open a website but already lives in Telegram. Asks what happened, checks safety, gives the action plan, shows the directory, and links to the PWA for anything that needs a screen (image analysis, the incident). No uploads, no stored user data.

## Documentation

| File | Owns |
|---|---|
| [`PRD.md`](./PRD.md) | scope — which parts of the journey the bot carries and which it hands to the app |
| [`DESIGN.md`](./DESIGN.md) | the conversation tree, message shapes, keyboard choices |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | grammY, flows, backend client, env, deployment |
| [`RULES.md`](./RULES.md) | invariants — no uploads, no memory, same words as the app |

Strings and steps come from `packages/guidance`; the directory comes from `apps/backend`. This app owns no schema.

## What this app does NOT do

- Accept images or files. If a user sends one, the bot says it does not look at files here and links to the app.
- Remember anything between messages beyond the current conversation state in memory. No database, no user table.
- Say anything the app does not say. One source of copy.
