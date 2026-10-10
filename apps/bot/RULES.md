# `apps/bot` — RULES

## Nothing leaves, nothing stays

- No file, photo, video or voice message is ever downloaded or forwarded. For files the bot reads Telegram's metadata only (name, extension, MIME, size) and replies by type; for photos and videos the reply is one sentence and the app link.
- A forwarded link is sent to `links.check`; the bot never opens it and never says "safe" — "ничего известного не найдено" is the strongest positive wording allowed.
- No chat id, username or message is written anywhere. Logs carry step names and error codes only.
- Conversation state lives in memory and dies with the process.

## Same journey, same words

- Every string comes from `packages/guidance`. A string that exists only in the bot is a bug.
- Safety check comes right after the situation, exactly as in the app. Threat / unsure / urgent routes to the urgent message and offers nothing else.
- The bot never interprets free text. It re-shows the current buttons.

## Honesty

- Every directory card shows the DEMO label while `is_demo` is true.
- The bot never claims a human is reading, never promises a reply, never gives a phone number that is not `verified` in the backend.

## Operations

- The bot token is read from env and never appears in a log or an error message.
- One running instance. Scaling to two is a pilot concern that needs webhook mode first.
- Backend calls have a timeout; on failure the bot says the list is unavailable right now and keeps the rest of the flow working.
