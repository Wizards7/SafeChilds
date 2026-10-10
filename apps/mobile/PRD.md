# `apps/mobile` — PRD

**Status:** Draft 2026-10-09 — being edited live while the screens are discussed. Phases are hackathon phases (days), not product phases.

## The user

A teenager in Tajikistan who found a fake image, a fake video, an impersonating account, threats or harassment online. They open the app frightened, often alone, usually on an Android phone on mobile data. They may not want their parents to know. They need to understand what to do next and reach a real human — not to be told whether an image is "92% fake".

## Phase 0 — the spine (no demo without it)

| # | Screen | What it does | Decided |
|---|---|---|---|
| 0 | Language | First open: Тоҷикӣ / Русский. One tap, remembered on the device | yes |
| 1 | Home | "Something happened online?" + four category cards (from the organizers' threat map), each opening 2–3 concrete situations, plus "не знаю, что произошло". If an incident exists, a "Continue" card on top | yes — 2026-10-10 |
| 2 | Safety check | "Are you safe right now?" — four answers. Threat / not sure / urgent → Urgent screen, skipping everything else | yes — always the screen right after the situation |
| 3 | Urgent | Tell a trusted adult now + verified numbers only (empty state until a human on the team verified them) + directory urgent section | yes |
| 4 | Analyze | Offered, not forced, for fake photo / fake video. Four steps: rules → three context questions → local checks + compare with the original → result as **tier + markers + "где смотреть" + next step**. Detail below | yes — optional; detail saved 2026-10-10 |
| 5 | Action plan | "Where did it happen?" (Instagram / TikTok / Telegram / VK) at the top, then steps for situation × platform with checkboxes | yes — platform picked here, not on Home |
| 6 | My Incident | The one local incident: type, platform, saved link, screenshots, done steps. "Start over" wipes it with confirmation | yes — one incident |

## Categories and situations (Home)

Four of the organizers' six threat categories belong to case 05. Each category's content follows their four-question scheme — что это · как это выглядит · почему ребёнок молчит · что помогает — in `packages/guidance`. Grooming and dangerous content belong to other cases and are out.

| Category | Situations |
|---|---|
| Поддельный контент | fake photo of me · fake video of me · someone pretending to be me |
| Вымогательство | they threaten to publish my photos · they demand money or more photos |
| Мошенничество | a profile asks for money or a code · I already sent money or a code |
| Кибербуллинг | they insult or humiliate me publicly · they write to me and don't stop · a group turned against me |
| — | не знаю, что произошло |

Content order: fake content and extortion first (the demo path), then fraud and cyberbullying. A category ships with a shorter plan rather than a missing one.

## Analyze — detail (saved 2026-10-10)

The team's idea, reviewed and kept: tiered, no percentages, escalation only when needed, and every result shows *where to look*.

**Step 1 — rules.** No intimate images of anyone; the file is deleted after the result; the plan is available without this step.

**Step 2 — three context questions** (from `packages/guidance`): Is this a photo of you? Do you have the original on this phone? Where did it appear, and how old is the account if you know. Context decides more cases than pixels; these change what we check and what the plan says.

**Step 3 — local checks, no upload.** EXIF presence and contradictions; C2PA manifest. If the original exists: side by side on the phone, differences marked. Two outcomes matter equally: it differs (evidence, tier 1) or it matches — "this is your real photo used without permission", which routes to the non-consensual-use plan instead of the fake-content plan.

**Step 4 — model indicators** via `analysis.run`: indicator codes only, rendered as numbered markers labelled *возможно*.

**Result = tier + markers + "где смотреть" + next step.** Tiers are decided by code in `packages/analysis`; the model can add markers, never raise a tier:

| Tier | Triggered by | Shown as |
|---|---|---|
| Есть доказательства изменения | verifiable facts only: C2PA says generated/edited, metadata contradicts itself, differs from the kid's original | the fact + where to check it |
| Есть признаки возможной подделки | model indicator codes only | markers on the image, each *возможно* |
| Не удалось определить | nothing verifiable, model found nothing | the six general signs as a self-check against the image |
| Проверка недоступна | API down, file rejected | local checks still shown |

**"Где смотреть"** — the part that makes the result usable: markers on the image, each opening "what it is + how to check it yourself"; and a short list of checks the kid can do that we can't (reverse image search with the exact taps; file properties → Software field, only when we found it; Content Credentials, only when present). Only items we have evidence for; no padding. Every item ends with what it means for the next step ("argument for the platform report", "save to evidence"), never a verdict.

**Ask a real person** — a hand-off, not a queue. Appears only on tiers 2–3 and only when the kid says they need a determination (school, police, parents won't believe them). Opens the directory filtered to organisations that can look at evidence (VERIFY which exist in Tajikistan; the МВД trust line 1919 may be the door for extortion). The kid keeps the image on the phone and brings it. Labelled prototype. A real review queue is re-added only when a partner organisation agrees to receive cases, with a consent flow and a legal review for minors' images — it would mean storing children's images, which we do not do.

**Rules that survive every tier:** safety check comes first; Analyze is optional; a pending or inconclusive result never blocks the plan; nothing ever tells the kid to contact the account.

## Extortion — detail (saved 2026-10-10)

The team's idea, reviewed and kept: two doors — *what to do* and *help me calm down* — with one correction: a stop card comes before the doors, because blackmailers run a countdown and a kid can pay in the middle of a breathing exercise.

**Stop card** (ten seconds, no choice): не плати · не отправляй ничего · не удаляй переписку · не спорь с ним · ты не виноват(а). Then the two doors, each linking to the other at the bottom.

**Door 1 — Что делать дальше**, in this order because the order is the advice:
1. Сохрани доказательства — screenshots of the demands, username, payment details, dates. Don't delete the chat: shame makes kids delete; the police need it.
2. Прекрати общение, но не блокируй сразу — stop replying first, block after the screenshots, and say why.
3. Пожалуйся на платформе — exact taps, reason "шантаж / интимные изображения". No promise of removal.
4. Take It Down (NCMEC) — for under-18 intimate images, a hash is created on the phone, the image never uploaded; participating platforms block it from being posted. VERIFY it works from Tajikistan before it goes on a screen. If it does, it is the one technical weapon the kid has and it fits "no image leaves the phone".
5. Расскажи взрослому — with a ready message, copy or share in one tap: "Мне нужна помощь. Меня шантажируют в интернете. Я не знаю, что делать. Пожалуйста, не ругай меня." This is the answer to "почему ребёнок молчит".
6. Сообщи — МВД trust line 1919 (VERIFY by phone) and the directory.
7. Если уже заплатил(а) — separate branch: it does not stop after payment, don't pay again, same steps, no shame.

**Door 2 — Мне тяжело**: the 60-second breathing with the expanding circle plus one generated ambient sound (Web Audio) or one CC0 track. No music library, no "choose your music" screen — re-add trigger: pilot feedback. Always ends with "Готов(а) к следующему шагу?" → Door 1. Calming is a pause, not an exit.

**Category-specific safety:** the safety check before this stays, and the "не уверен" / "срочно" answers matter most here — sextortion is the category with documented self-harm risk. Urgent screen's first line for extortion: "Ты не виноват(а). Это преступление против тебя, не твоя ошибка." Nothing ever suggests negotiating, paying a smaller amount, or sending a "proof" image. No "we're on it".

**Where it lives:** category *Вымогательство* in `packages/guidance` (stop card, two doors, seven steps, ready message ru + tg, numbers behind VERIFY). Screens: `/plan` with a category header card, `/breathe` for door 2. New components: the stop card and the share-message button; nothing else.

## Fraud — detail (saved 2026-10-10)

The team's idea, reviewed and kept: two options — step-by-step block and report on social, and a "is it safe to open?" check in the bot. Links in, files by type only, same honesty tiers as images.

**Option 1 — social, the plan** (category *Мошенничество* in `packages/guidance`):
1. Сначала — не отправляй: деньги, код из СМС, фото, данные карты. "Код из СМС не сообщают никому — даже «банку»."
2. Сохрани — screenshot the profile, messages, payment details.
3. Пожалуйся — exact taps, reason "мошенничество / спам".
4. Заблокируй — after the screenshots.
5. Предупреди — if a friend's hacked account was used, tell the friend by another channel (call, not DM).
6. Если уже отправил(а) — the branch that brings kids here: call the bank hotline now (VERIFY numbers: Alif, Eskhata, Амонатбанк, Душанбе Сити), block the card, change passwords where the code was used, tell an adult, report to МВД 1919. No shame.

*Как это выглядит* for this category = the scam-profile signs (new account, few posts and many followers, easy-money promise, "напиши в личку") — the learn-the-signs cards.

**Option 2 — "Проверить ссылку"** in the bot and under the fraud category in the app. One backend procedure `links.check({ url }) → { tier, findings[], finalUrl, nextSteps }`, rate-limited per IP, nothing stored; rules live in `packages/analysis` next to the image rules. The backend expands redirects itself with a HEAD request; the kid never opens the link.

| Tier | Source | Shown as |
|---|---|---|
| Известная опасная ссылка | blocklist hit — Google Safe Browsing, URLhaus (VERIFY free access and limits) | the fact + which list |
| Есть признаки обмана | deterministic checks: real domain after redirects, lookalike vs known brands (`alif-tj.com` vs `alif.tj`), domain registered days ago (RDAP), shortener, asks for a code or payment | где смотреть: the real address, the registration age, the lookalike comparison |
| Ничего известного не найдено | no hits, no signs | "это не значит, что безопасно" |
| Проверка недоступна | API down | the general rules |

Every answer ends with the next step: don't enter codes, don't install anything, how to report the sender.

**Files — never downloaded, judged by type.** Telegram's message metadata gives name, extension, MIME type and size without the contents; the bot reads that and nothing more.

| Arrived | Bot says |
|---|---|
| `.apk` | installer for Android — never install apps from a chat, only from Play Store; fake "bank" apps are the main way money is stolen |
| `.exe` `.scr` `.bat` `.msi` | a program — don't open; no service sends programs in a chat |
| `.pdf` `.docx` `.xlsx` | we can't see inside; the danger is "enable content / macros" and links inside — open in view mode only, never press "enable"; if it promises money or asks for a code, don't open |
| photo / video | the file itself isn't dangerous; the link or request that comes with it is → link check |
| `.zip` `.rar` | an archive hides the type inside — don't unpack from a chat |
| anything else | we don't check files inside; here are the signs of a dangerous one |

Why no content scan: uploading a kid's file to a scanner shares it with dozens of AV vendors; a clean scan still can't say "safe" (fresh scam APKs are in no database); and it's a day we don't have. Re-add trigger: pilot, a hash-only lookup (download to memory, hash, discard, ask "is this hash known bad?") if type rules prove insufficient.

**Owner split:** Ali writes `links.check` Saturday morning; the bot person wires the flow and the file-type replies.

## Phase 1 — support (makes it human)

| # | Screen | What it does |
|---|---|---|
| 7 | Feelings | Eight answers including "I don't want to answer". Picks which support to offer. Never diagnoses |
| 8 | Breathe | One 60-second guided breathing. Skippable at any second. Offered only when feelings suggest it |
| 9 | People | Directory with filters: language, city, online / in person, works with teens. DEMO banner. Contact method per card. "Report inaccurate listing" |
| 10 | Privacy | Plain language: what we store (nothing), what we send (one image, deleted after), limits of confidentiality |

## Phase 2 — only if P0 + P1 are green on three phones by Sunday night

- Grounding exercise (5-4-3) as a second coping option
- Calm audio (licensed or original only)
- Sightengine score as an extra analysis signal (VERIFY free signup from Tajikistan)
- Install prompt tuning; guidance works offline after first open
- Parent / teacher entry on Home

## Cross-cutting from day one

- `ru` + `tg` on every screen; crisis copy in Tajik reviewed by a native before the demo
- Installable PWA; `theme-color` set; safe areas respected
- Bottom nav: Home · My Incident · Support · People. Analyze lives inside the journey, not in the nav
- Install prompt appears after the first completed plan step, never on first open

## Skipped, with the trigger that re-adds it

| Feature | Trigger |
|---|---|
| Accounts, OTP, consent flows | real referrals |
| Multiple incidents | pilot feedback |
| Video or URL analysis | a validated method exists |
| Incident export (PDF for a parent or police) | pilot feedback |
| Push notifications, follow-up reminders | native graduation |
| Any chat or "AI psychologist" | never |

## Open questions

- Which four platforms matter most for teens in Tajikistan — is VK still relevant, is Likee? Owner: floater, Friday.
- Which organisation in Tajikistan can look at evidence of a fake (for the "ask a real person" hand-off)? Owner: floater, with the helpline calls.
- Take It Down (NCMEC) — does it work from Tajikistan, which platforms participate as of today? Owner: Ali, Friday. Nothing about it reaches a screen until verified.
- Learn-the-signs quiz (Phase 1), floating help button on every screen, bold headline weight on our palette, "pop the anxious thoughts" replacing grounding in Phase 2 — proposed after reviewing the organizers' example (Лупа); confirm or kill.
- Does the teen pick a situation first or the safety check first for a user who arrives via the bot link? Current answer: situation, then safety, same as the app.
