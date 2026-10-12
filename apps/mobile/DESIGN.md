# `apps/mobile` — DESIGN

**Updated 2026-10-10** after the four category ideas and the identity decision were saved. Scope per phase is in [`PRD.md`](./PRD.md); this file is how it looks and behaves.

## The principle: the app adapts to the kid; the kid never browses the app

Four or five taps build a **situation profile**. Every screen after that is composed from the profile — steps, tools, support, directory filters. Nothing that doesn't match the profile exists on screen: no "all categories", no step for a platform they didn't name, no "check a link" when the problem is a fake photo. A kid who opens the app frightened sees one question or one action at a time, never a menu.

### The inputs — at most five taps before the plan

| Tap | Question | Why |
|---|---|---|
| 1 | Category — four cards | picks the skeleton |
| 2 | Situation — 2–3 under the card | picks the steps |
| 3 | "Ты сейчас в безопасности?" | urgent, or continue |
| 4 | One category question | extortion *уже заплатил(а)?* · fraud *уже отправил(а)?* · cyberbullying *один раз или продолжается?* · fake content *есть оригинал?* |
| 5 | Platform — asked only when a step needs it, inside the plan | the exact report taps |

No typing. Under thirty seconds.

### The profile

```
category · situation · safety · platform?
flags: ongoing · alreadyPaid · alreadySent · hasOriginal · photoShared · intimate · threatened
```

Stored in the on-device incident ([`SCHEMA.md`](./SCHEMA.md)). The whole app renders from this one object; the bot renders from the same object with a different renderer.

### How content declares where it belongs

Every item in `packages/guidance` — a step, a tool, a support option, a directory filter — carries a `showWhen` over the profile. The plan is **composed from matching items**, never picked from a list of pre-written plans. A new flag is a new condition, not a new screen. The vocabulary is defined in [`packages/guidance/README.md`](../../packages/guidance/README.md).

## Screens

| # | Route | What's on it | Shown when |
|---|---|---|---|
| 0 | `/welcome` | Three beats, first open only, each one illustration + one sentence: **1** "Что-то случилось в интернете? Поможем понять, что делать. Шаг за шагом." · **2** "Без регистрации. Ничего не храним. Всё остаётся на твоём телефоне." · **3** "Ты не один. Здесь есть путь к настоящему человеку." → [Начать]. Language is never a step: the phone's system language decides (tg → тоҷикӣ, else русский) and the Тоҷикӣ / Русский toggle sits in the header of beat 1. "Пропустить" top-right on every beat; dots + Далее + swipe; illustrations enter in 250 ms (updated 2026-10-12) | first open only; deep links (`?from=bot`, the QR) bypass it; "Start over" keeps the flag; re-readable from Privacy |
| 1 | `/` Home | mark + wordmark header with the red "Помощь" pill · "Что-то случилось?" + "Выбери, что ближе к твоей ситуации." · four category tiles (illustration from Ali's set in `public/home/`, title, one-line description, chevron) · "Не знаю, что произошло" row → `/chat` · small "Узнать признаки" entry · "Конфиденциальность" footer → `/privacy`. The case and its "Продолжить" live in "Мой случай" only (Ali, 2026-10-12 evening). "Не знаю, что произошло" is also a one-tap button on `/chat`; privacy also sits in "Мой случай" under Настройки (updated 2026-10-12) | always |
| 2 | `/situation` | 2–3 situations of the chosen category, one per row. A tap while a case already exists asks first: keep the current case (→ plan) or start a new one and delete it. Never a silent overwrite | after a category |
| 3 | `/safety` | one question, four answers, nothing else — no nav, no skip, no progress dots | always, right after the situation |
| 4 | `/urgent` | "Ты не виноват(а)." · tell an adult now, with the ready message · verified numbers (empty state "уточняем местные номера" until a human verified them) · directory urgent section · quiet "Я в безопасности, продолжить" | safety = threat / unsure / urgent, or the floating help button |
| 5 | `/question` | the one category question — its own screen, one question per screen is the rule | one per category |
| 6 | `/stop` | extortion stop card: не плати · не отправляй · не удаляй · не спорь · ты не виноват(а) → two doors: Что делать дальше / Мне тяжело | category = extortion |
| 7 | `/analyze` | four steps: rules → local checks + compare with the original → markers + "где смотреть" → tier + next step. Optional, skippable at every step | fake photo / video, or `photoShared` |
| 8 | `/link` | paste a link → four tiers + "где смотреть" + next step | category = fraud |
| 9 | `/plan` | platform picker at the top only if a step needs it → **three steps "сейчас", the rest under "потом"** (opens when the three are ticked, or on demand) · each step one line, "как / почему" collapsed · ready-message button on the "tell an adult" step · "Узнать больше" link to the category's что это / как выглядит | always — the heart |
| 10 | `/feelings` | the Поддержка tab (Ali's mockup, 2026-10-12): page title · "Поговорить с человеком" card with the teen-and-adult picture (→ `/people`) · "Как ты сейчас?" + "Выбери, что чувствуешь. Можно не отвечать." · six illustrated feeling tiles (one teen in a hoodie for all six, `public/feelings/`) · breathing card "Минутка, чтобы выдохнуть" · "Вернуться к плану" only with a case. No answer is required: the hint says so and nothing waits for one; "не знаю" / "не хочу отвечать" remain in the guidance list for the bot | the Поддержка tab; offered after the plan; first for "группа против меня" |
| 11 | `/breathe` | 60-second expanding circle + one generated ambient sound; skippable any second; ends with "Готов(а) к следующему шагу?" | feelings = scared / anxious / overwhelmed, or extortion door 2 |
| 12 | `/thoughts` | "pop the anxious thoughts" — bubbles with an answer under each | Phase 2; feelings = ashamed / sad, or cyberbullying |
| 13 | `/people` | filters: language / city / online–in person / works with teens · DEMO banner · school psychologist entry for cyberbullying · per card: **Свяжусь сам(а)** / **Пусть со мной свяжутся** · "report listing" | from the plan and the nav |
| 14 | `/request` | the contact request: обращение · один контакт · язык · возраст (bracket) · онлайн / лично · когда удобно · кто может ответить вместо тебя · consent. Prototype label in the hackathon | from a professional's card, second path only |
| 15 | `/incident` | the "Мой случай" tab (redesigned 2026-10-12 night from Ali's mockup): page title under the brand row, gear → `/settings` in the header, no "Помощь" pill on this tab · the case card (started, situation, platform chip, analysis tier when checked, "{n} из {m} шагов выполнено" + progress bar, "Продолжить план") · Доказательства (saved links, labelled link field, screenshot thumbs, outlined "Добавить скриншот") · Твои шаги as real checkboxes (the same `toggleStep` as the plan) · "хранятся на этом устройстве" line · "Удалить этот случай" with confirm. The empty state keeps the card and "Что-то случилось?" under the same title | from the nav |
| 16 | `/privacy` | what we store (nothing), what we send (one image / one link, deleted), confidentiality limits, Telegram is the kid's own channel, the model provider's policy line · "О приложении" re-opens the welcome | from `/settings` and the welcome's second beat |
| 17 | `/signs` | learn-the-signs cards, five per category, Лупа-style reveal with numbered markers | Phase 1; from Home only, never inside a journey |
| 18 | `/settings` | Настройки: language toggle, privacy link. Light only, no account, nothing else (2026-10-12) | the gear in the "Мой случай" header |

Not pages: the **help control** (every screen → `/urgent`; the only element that ignores the profile). Since 2026-10-12 evening it is a red "Помощь" pill at the right of every header, always visible except on `/incident` (Ali, 2026-10-12 night: the gear and the pill crowded that header; the tab is a review screen, not a journey step); the floating pill is gone and the **desktop shell** (≥ 768 px: phone frame + QR + pitch line + "what is real / what is prototype"). The **opening splash** (`components/Splash.tsx`, 2026-10-12): the mark on the app background from the first paint until the first screen is in place, 200 ms fade, 3 s cap, never between screens.

Out for the hackathon: `/about` (parent / teacher "browse everything") — re-add trigger: pilot, a parents/schools page. `/lock` (PIN on "Мой случай") — Phase 2 if cheap, else pilot.

## Journey graph

```
/welcome (first open) ─► /  ─► /situation ─► /safety ─┬─ safe ──► /question ─► [/stop] ─► [/analyze | /link] ─► /plan ─► [/feelings ─► /breathe | /thoughts] ─► /people ─► [/request] ─► /incident
                                                      └─ threat / unsure / urgent ──► /urgent ──► "продолжить" ──► /plan
```

Brackets = shown only when the profile says so.

## Nav

A floating pill with three tabs, full width: **Главная · Поддержка · Мой случай** (updated 2026-10-12 evening: the round "Опиши своими словами" button beside the bar is gone, the chat door is the "Не знаю, что произошло" row on Home; "Профиль" became "Мой случай" because there is no profile, only the one case). Hidden on `/welcome`, `/safety`, `/urgent`, `/stop`, `/breathe`. Analyze, link, stop, question, request — inside the journey, never in the nav. "Поддержка" opens `/feelings`, whose first row is "Поговорить с человеком" → `/people`; "Мой случай" opens `/incident`, which carries the case; the gear in its header opens `/settings` (language, privacy). The language toggle lives only there. No tab is an account.

## What keeps a screen light

- One screen, one question or one action. Never two questions on one screen.
- Steps are cards: what to do in one line; "как" (exact taps) and "почему" collapsed under a tap.
- Three steps now, the rest later. Eight at once is a wall.
- No explanation before action. "Что это / как это выглядит" exists behind "Узнать больше", never in the path.
- Every screen: one primary action, one secondary (skip / back / help), nothing else.
- Loading, empty, error and offline are designed states on every screen that touches the backend; guidance never needs the network after first load.

## Visual direction

Calm Trust, from [`assets/design/design-system/tokens.css`](../../assets/design/design-system/tokens.css) (promoted to `packages/ui` at scaffold): neutrals dominate; blue is the one primary action per screen; teal only on the human-support side; red only on `/urgent` and the stop card. Light only. Icons Lucide inline SVG.

**Headlines are bold** — the warmth comes from type weight and copy, not from colour or illustration: "Что-то случилось?" not "Сообщить об инциденте"; "Ты не виноват(а)" as the first line wherever it applies. Type scale (mobile) 28 / 22 / 18 / 16 / 14, nothing under 14. Inter self-hosted, Tajik glyphs verified on the foundation sheet.

Illustrations: none in Phase 0; the headline is the visual. Phase 2 polish: three flat SVG spot scenes in the palette for `/welcome`, drawn in code — never a purchased isometric kit.

Motion: ≤ 300 ms, named properties only, `prefers-reduced-motion` respected; the breathing circle is the one longer animation and it is the content.

## Workflow (playbook method)

1. Tokens + foundation sheet — done 2026-10-09.
2. One standalone HTML file per screen in `assets/design/mobile/`, opened on a real phone, each with a state-switcher bar (normal / loading / empty / error / offline). Real `ru` + `tg` strings. Build order: Home → situation → safety → plan → urgent → analyze → people → incident → stop / question / link → feelings / breathe → welcome / privacy → signs.
3. Ideation pass with `taste-skill`; after approval every change is surgical in the file.
4. Approved files → `html.to.design` → one Figma file, the design home for the CRM and bot people.
5. The sketches' CSS becomes the app's styling foundation.

## Open design questions

- Breathing visual: expanding circle (chosen) — confirm on the phone that it reads at 60 fps on a cheap Android.
- The "three now" rule on a plan with only four steps: show all four. Threshold is five.
- `/lock` — PIN or biometric on "Мой случай": Phase 2 if the floater's testing shows kids worry about parents reading the phone.
