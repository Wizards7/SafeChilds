# 0005 — Guided chat: "Опиши своими словами"

**Status:** Approved 2026-10-11 (supplements 0001; a narrow, stated exception to its "any chat or AI psychologist — never" line)

## The decision

A kid who does not find their tile can write what happened in their own words, in the app (`/chat`) or to the bot (any free
text). The model reads it and returns **codes only**: a category, a situation, flags, a safety level, up to three existing
step ids and a route. The app and the bot render the reviewed guidance for those codes. **The model never writes a sentence
the kid reads.** That is what keeps 0001's reason intact: every word on a screen was reviewed by a human.

| It is | It is not |
|---|---|
| a door into the existing plan for the kid who cannot name the situation | a conversation with an AI |
| codes → reviewed steps, same honesty contract as the image analysis | generated advice, an "AI psychologist", a verdict |
| rules first: self-harm words open the urgent screen without a model call; threat words raise the safety level | a replacement for the safety check — the plan route still passes through `/safety` |
| the kid's words kept in "Мой случай" on the phone, cleared by "Начать заново" | a server-side history at any retention |
| one text in memory for one request, same as the image | training data, logs with the text, analytics |

## Where it lives

- `packages/analysis/src/triage.ts`: the prompt built from the one guidance catalogue, the Zod contract, `parseTriage` (unknown step ids dropped, a situation forces its category, a non-ok safety forces the urgent route), `crisisLevel` with the word lists (VERIFY the Tajik entries with a native speaker; add, never remove).
- `apps/backend/src/modules/triage/`: `triage.reply` — rules, then the model, validated; nothing stored; the log carries the outcome and the error name, never the text. The text model client sits next to the image one in `modules/analysis/anthropic.ts`.
- `apps/mobile/app/chat/`: the thread and the composer; `incident.chat` in IndexedDB; Home entry: the "Не знаю, что произошло" row (the round bar button beside the nav was removed 2026-10-12 evening, one door, on Home); the privacy page lists the text as the fourth thing that leaves the phone.
- `apps/bot/src/bot.ts`: free text → `triage.reply` → step titles + "Да, это моя ситуация" (starts the normal flow) or the start buttons; a non-ok safety sends the urgent message.

## Routing by the codes

| Codes | App | Bot |
|---|---|---|
| safety urgent or threatened | profile updated, safety set, `/urgent` at once | urgent message with the ready text for an adult |
| situation known, confidence high | profile updated, steps shown, "Перейти к плану" → `/safety` first, as always | steps + confirm button → safety check |
| category only | steps if any, "Выбрать из списка" | that category's situations |
| nothing | reviewed "напиши подробнее" line | the start buttons |
| model failed or no key | reviewed fallback: pick from the list, or talk to a person | the start buttons |

## Re-open triggers

A conversation with generated text: only with a partner organisation's safeguarding protocol, a legal review for minors'
data, and on-duty humans behind it — the same trigger as in-app chat with a professional in 0001.
