# `apps/bot` — DESIGN

A bot's design is its conversation. Every message below uses the exact strings from `packages/guidance`; this file shows shape and order, not final copy.

## Conversation tree

```
/start
 ├─ language: [Тоҷикӣ] [Русский]
 └─ "Что-то случилось?"            six situation buttons (inline keyboard, 1 per row)
      └─ "Ты сейчас в безопасности?"   [Да] [Мне угрожают] [Не уверен(а)] [Нужна срочная помощь]
           ├─ Да ─────────────────► "Где это произошло?"  [Instagram] [TikTok] [Telegram] [VK]
           │                              └─ action plan: one message, numbered steps, then
           │                                 [Поговорить с человеком] [Проверить изображение → app] [Мой случай → app]
           └─ угрожают / не уверен / срочно ─► urgent message (trusted adult now) + [Найти помощь сейчас]
                                                  └─ directory, urgent section first
Поговорить с человеком
 └─ directory cards: name · role · languages · city · format · DEMO label · how to contact
    [Ещё] [Сообщить об ошибке в карточке]
```

## Message rules

- One question per message. Buttons, not typed answers. Free text gets the current question's buttons again.
- The urgent message has no buttons except the directory. No exercises, no plan, no "would you like to…".
- Every directory card carries the DEMO label in the first line during the hackathon.
- Messages are short. A plan is never more than one screen on a phone; if it is longer, it is split by step group.

## Hand-off links

Deep links to the PWA carry only the locale (`?lang=tg`). Never the situation, never anything from the conversation.

## Open design questions

- Reply keyboard (persistent bottom buttons) or inline keyboard (under the message)? Current answer: inline for choices, one persistent "Начать заново" reply button.
