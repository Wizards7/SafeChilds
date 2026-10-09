# `apps/bot` — ARCHITECTURE

## Decisions locked (2026-10-09)

- **grammY** on Node, TypeScript. VERIFY once at setup that the current grammY version's conversation/menu plugins cover the inline-keyboard tree; if not, hand-rolled state per chat in memory is ~100 lines and acceptable.
- **Long-polling** for the hackathon. Webhook mode is a pilot re-add.
- **No database.** Conversation state is an in-memory map keyed by chat id, lost on restart by design.
- **Backend over tRPC** with a plain-fetch client for `directory.list` and `reports.create`. Nothing else is called.
- **Copy from `packages/guidance`**, same enums, same strings as the app.

## Structure

```
src/
  bot.ts          grammY setup, long-poll, error handler
  state.ts        in-memory per-chat state (locale, step)
  flows/
    situation.ts
    safety.ts
    plan.ts
    people.ts
  i18n.ts         picks ru/tg strings from packages/guidance
  trpc.ts         backend client
```

## Environment

| Var | Purpose |
|---|---|
| `BOT_TOKEN` | from BotFather; never logged |
| `API_URL` | backend origin |
| `APP_URL` | PWA origin for hand-off links |

## Deployment

Railway service `bot`, a single long-running Node process. No port needed in long-poll mode. One instance only — two pollers on one token fight each other.

## Testing

Typecheck + lint. Flows are exercised by hand in Telegram on Sunday with the demo script; the guidance content they render is the same package the app renders, so the content is tested once.
