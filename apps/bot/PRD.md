# `apps/bot` — PRD

**Status:** Draft 2026-10-09

## Why a bot

Telegram is where teenagers in Tajikistan already are. A bot removes the "open a link, install something" step entirely for the parts of the journey that are text and buttons. It also demonstrates on stage that the guidance is a shared engine, not screens hard-coded in one app.

## Phase 0 (hackathon)

| Step | Bot does |
|---|---|
| `/start` | language choice (Тоҷикӣ / Русский), then "Что-то случилось?" with the six situations as buttons |
| Safety check | same four answers as the app; threat / unsure / urgent → urgent message: tell a trusted adult now + directory urgent section; nothing else offered |
| Action plan | asks the platform, then sends the steps for situation × platform, one message, from `packages/guidance` |
| People | `directory.list` filtered by the chosen language; three cards per page with "More"; DEMO label on every card |
| Hand-off | "Проверить изображение" and "Мой случай" send a deep link to the PWA with the locale preset |

Built by the bot person Thursday to Sunday; deployed Monday.

## Skipped, with the trigger that re-adds it

| Feature | Trigger |
|---|---|
| Image analysis in the bot | never through Telegram — files would sit on a foreign-hosted channel; the app does it |
| Feelings check and breathing | Phase 2 if time; a timer in chat is a weak version of the app's screen |
| Remembering the user between sessions | real referrals, with the same legal review as accounts |
| Webhook mode | pilot; long-poll is enough for a demo |

## Open questions

- Should the bot offer the safety check before or after the situation when the user types free text instead of tapping? Current answer: reply with the situation buttons; never try to interpret free text.
