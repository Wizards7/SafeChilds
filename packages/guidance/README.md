# `packages/guidance` — the content engine

Plain TypeScript, no dependency on Next.js or the database. Consumed by `apps/mobile` and `apps/bot`; both render the same items from the same profile. One source of copy: a string that exists in one app and not the other is a bug. Scope (2026-10-14): a situation's name, every step and every answer live here and are shared; presentation copy only the app shows (Home's tile lines, the situation tiles' short titles and lines in `apps/mobile/messages`) may live in the app and must mean the same as the shared name.

## Shape

Four categories — поддельный контент · вымогательство · мошенничество · кибербуллинг — each organised by the organizers' four questions: **что это · как это выглядит · почему ребёнок молчит · что помогает**. "Что помогает" is the plan; the other three are behind "Узнать больше" and the learn-the-signs cards.

A plan is not written per situation. It is **composed from items**, each carrying a `showWhen` over the situation profile. A new flag is a new condition, not a new plan.

## The profile (input to every `showWhen`)

```
category   fake_content | extortion | fraud | cyberbullying | unknown
situation  one of the eleven ids below
safety     safe | threatened | unsure | urgent
platform   instagram | tiktok | telegram | vk | null     (VERIFY the list with the floater)
flags      ongoing · alreadyPaid · alreadySent · hasOriginal · photoShared · intimate · threatened
```

Situations: `fake_photo` `fake_video` `impersonation` · `threat_to_publish` `demand_money_or_photos` · `profile_asks_money_or_code` `already_sent` · `public_humiliation` `persistent_messages` `group_against_me` · `unknown`.

## Items

Every item has an `id`, `kind`, `showWhen`, `order`, and strings in `ru` and `tg`.

| Kind | What it is | Example |
|---|---|---|
| `stop` | a card shown before anything else | the extortion stop card |
| `question` | the one category question | "Это один раз или продолжается?" → sets `ongoing` |
| `step` | a plan step: one line, "как" (exact taps, per platform), "почему" (one line) | "Ограничь, не только блокируй" with Instagram *Restrict* taps when `platform = instagram` |
| `tool` | a link into a tool screen | analyze when `situation in (fake_photo, fake_video)` or `photoShared`; link check when `category = fraud` |
| `message` | a ready message to copy or share | "Мне нужна помощь. Меня шантажируют в интернете…" |
| `support` | a support offer | feelings first when `situation = group_against_me` |
| `directory` | a directory filter or entry | school psychologist when `category = cyberbullying` |
| `urgent` | a line for the urgent screen | "Это преступление против тебя, не твоя ошибка." when `category = extortion` |
| `sign` | a learn-the-signs card with markers — not an item: `SIGNS[category]` in `content/signs.ts` (five per category, markers as `[n]` tokens in the mock lines), with `ABOUT[category]` for что это and почему ребёнок молчит | the scam-profile card |

`showWhen` is a small predicate language over the profile: equality on category / situation / platform / safety, truthiness on flags, `and` / `or`. No code in content.

## Ordering and the "three now" rule

Steps carry an `order`. The renderer shows the first three matching steps as "сейчас" and the rest under "потом"; with four or fewer matching steps it shows all. Some items change order by flag — "tell an adult" moves to position 2 when `ongoing` or `threatened` — expressed as two items with different `showWhen` and `order`, not as logic.

## Content rules (from the brief and the category reviews)

- No victim-blaming. "Ты не виноват(а)" is the first line wherever it applies.
- No promises: not of removal, not of confidentiality beyond what the Privacy page says, not of a reply.
- No legal advice, no "AI therapist" language, no diagnosis.
- Never suggest contacting, confronting, negotiating with or paying the perpetrator. Never "просто не обращай внимания" as the only advice.
- Evidence before blocking, always. Nothing is deleted before it is saved.
- Every number on a screen is verified by a human on a recorded date; until then the item renders its empty state.
- A step that states an unverified fact (a service, a number, how a platform behaves) waits outside the catalogue, in `PENDING_VERIFY` (`content/extortion.ts` holds Take It Down, 2026-10-14), until a human verified it: `ITEMS` feeds every screen, the bot and the chat model, so a flag is not a gate. The VERIFY badge is only for report taps (`verifyOnDay`). A test fails if any catalogue text carries "VERIFY".
- Tajik strings written by anyone other than a native speaker carry `VERIFY` until reviewed.
- Warm and direct: "Что-то случилось?", not "Сообщить об инциденте".

## Writing order (floater, with Ali defining the vocabulary first)

1. Fake content and extortion — the demo path.
2. Fraud and cyberbullying.
3. Learn-the-signs cards, five per category.
4. Tajik pass over everything.

A category ships with a shorter plan rather than a missing one. `unknown` («Не знаю, что произошло») is no exception (2026-10-13): `content/unknown.ts` gives it four steps that hold for any situation, built from the reviewed text of the category steps (the same objects, so a Tajik correction lands in both); the plan screen shows no platform picker there.
