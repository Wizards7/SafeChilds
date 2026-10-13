# 0004 — Demo runbook: what is left, who, when, and what to do when something breaks

**Status:** Approved 2026-10-11 (supplements 0001 and 0002; highest number wins on conflict)
**Purpose:** code is complete for the demo as of this evening. From here Ali works on design and the deck; this page is
what the team does on 12, 13 and 14 October, and how bugs get fixed on the spot instead of waiting.

## 1. Where we are tonight

| Thing | State |
|---|---|
| App | https://mobile-production-ea38.up.railway.app — 19 screens (with `/signs`) + `/offline`, installable, offline shell |
| API | https://backend-production-e657.up.railway.app — analysis (Anthropic key set), link check with redirects, lookalikes, domain age, Safe Browsing and URLhaus (both keys set), SSRF-safe |
| Bot | live with its token; situation → safety → plan → people; link check with hidden-link warning, defanged domains, coverage line; files judged by type; never-ask line with its @username |
| Honesty | every image and link result ends with "Проверено: … Не проверено: …" |
| Tests | 7 typecheck tasks, 142 tests (138 in CI; 4 need a database), CI green on `main` |
| Deploy | push to `main` → Railway rebuilds all three services in 2–3 minutes |

Not in the app on purpose: accounts, chat, server-side file scanning, our own fake detector, percentages, the word "безопасно".

## 2. What is left, by owner

| When | Who | What | Done when |
|---|---|---|---|
| 11 Oct night | Ali | send `docs/tajik-review.csv` (or the review page) to the native speaker; ask for it back 12 Oct evening | sent |
| 11 Oct night | Ali | ask one team member for the demo photo: their own picture, one edited copy with metadata stripped, the untouched original on the demo phone | assigned |
| 11 Oct night | Ali | assign the four helpline calls to the floater | assigned |
| 12 Oct | floater | call the lines in `packages/directory/src/seed.helplines.ts`: number, hours, languages, do they take teenagers; send the four answers to Ali | four answers in chat |
| 12 Oct | native speaker | the review: 715 strings, "ту", the six Tajik letters, brands untouched, braces and `[n]` untouched | CSV back |
| 12 Oct | team | install the app on three phones from the QR; run the script in § 3 once each; write every oddity in one chat thread with phone model + screen + what happened | thread exists |
| 12 Oct | Ali | design and the deck (§ 5); nothing in code | — |
| 12–13 Oct | Claude (with Ali's go) | helpline answers into the seed; Tajik corrections into guidance, analysis, directory, bot and `tg.json`; `verify: true` dropped only on reviewed strings; every bug from the thread | pushed, Railway green |
| 13 Oct | everyone | five full runs of § 3 on three phones, two of them in Tajik | the script runs clean twice in a row |
| 14 Oct morning | everyone | one last run on the demo phone and the projector laptop; phone on charger; mobile data on, Wi-Fi off during the run | — |

Nothing new ships after the night of 12 Oct. 13 and 14 Oct are fixes only.

## 3. The three-minute script, with what to say

Projector: the laptop shows the app in the phone frame with the QR beside it. Judges scan it while you talk.

**Before every run** (each rehearsal and the stage run), on the projector laptop and on every phone: Мой случай → «Удалить этот случай» → «Удалить». A case left from the last run makes step 1 ask «У тебя уже есть случай» instead of opening the safety check, and step 7a rewrites that case.

1. **Home → "Кто-то сделал фейковое фото со мной".** Say: four categories from the organizers' scheme, each with concrete situations.
2. **Safety: "Да, я в безопасности".** Say: this screen is always next; "мне угрожают" skips everything and opens the urgent screen.
3. **Question: "Да, проверить"** → the prepared demo image → wait for the result. Say: metadata and Content Credentials are checked on the phone; one image goes to the model and is deleted; the model only points, it never judges. Point at the **"Проверено / Не проверено"** line: "we tell the kid what we could not check". If the tier comes back "не удалось определить", say that out loud: the honesty is the feature, and show the six self-check signs.
4. **Plan, platform Instagram.** Tick "Сохрани ссылку" and "Сделай скриншот". Open "Пожалуйся в Instagram" to show the exact taps and the VERIFY badge. Say: three steps now, the rest later; the ready message for an adult.
5. **"Поговорить с человеком" → People.** Say: demo cards, labelled; two paths; no account, no identity until the moment of contact.
6. **Bottom nav → Мой случай.** Say: everything lives on the phone, nothing on our server.
7. **Home → "Узнать признаки" → Мошенничество**, reveal one card. Say: the organizers' "как это выглядит", twenty cards, built from their own workshop examples.
7a. **Optional, Home → «Не знаю, что произошло»** (opens «Своими словами»). Type in the box at the bottom: "мне пишет человек из банка и просит код из смс". Do not tap the «Не знаю, что произошло» button inside the first bubble: it leaves the chat for the safety check. Say: the model turns the words into codes, the steps on screen are the reviewed plan, not generated text; a kid who writes about hurting themselves goes straight to the urgent screen without any model. Plan 0005.
8. **Phone 2, Telegram.** `/start` → Русский → Мошенничество → «Профиль просит деньги или код» → «Да, я в безопасности» → «Нет, сразу к плану» → platform → plan (20 s). Then paste `https://testsafebrowsing.appspot.com/s/phishing.html` → «Известная опасная ссылка», «Она есть в списке опасных сайтов. Не открывай.», the host written as `testsafebrowsing[.]appspot[.]com`, and the coverage line with «списки опасных сайтов» under «Проверено». Say: the list that matched is Google Safe Browsing (the bot shows the verdict, not the list's name); the same guidance, a second door, the link never opens on the kid's phone.
9. **Close:** "Мы не определяем фейки. Мы помогаем сделать следующий безопасный шаг и дойти до настоящего человека."

Backup links for the bot if you want a second one: `https://alif-tj.com/bonus` gives "признаки обмана" (lookalike + bonus word) without the site existing. A hidden link: type `alif.tj`, select it, "Add link", paste `https://alif-tj.com/login`.

## 4. If something breaks, 12 to 14 October

1. **Report in the thread, one message:** phone model, which screen, what you tapped, what you saw, a screenshot. Nothing else is needed.
2. **Ali pings Claude** with the message. Fix → test → push → Railway rebuilds in 2–3 minutes → the thread gets "try again". Typical turnaround: under 30 minutes.
3. **If a fix makes things worse:** `git revert <commit>` and push; Railway rebuilds the previous state. Nothing is ever patched by hand on the server.
4. **If a service is red on Railway:** open the service → Deployments → the latest one → View logs. The log says why: the bot prints "Invalid environment" when a variable is missing, the backend prints the model or blocklist error by name.
5. **If analysis says "недоступна" on every image:** check the Anthropic balance (platform.claude.com → Billing) and the backend log for `model call failed: … 401`.
6. **Never on demo day:** new features, dependency updates, variable changes you do not need. The app that ran clean on 13 Oct is the app on stage.

Useful commands from the repo folder:

```
railway logs --service backend      # or bot, mobile
railway deployment list --service backend
pnpm typecheck && pnpm test         # before any push
pnpm --filter @safechilds/backend exec tsx ../../scripts/tajik-review.ts   # regenerate the review files
```

## 5. Deck: the text, ready to design

One idea per slide, the demo carries the rest.

1. **Title.** SafeChilds. Case 05: "Выглядит как настоящее, но это не так". Team names.
2. **The kid.** Зарина, 14, Душанбе. Someone edited her photo and the class chat is laughing. Her fear: parents will blame her and take the phone. Her need: a clear algorithm, where to tap, not a lecture.
3. **The promise.** We don't detect fakes. We help the kid take the next safe step and reach a real human. Analysis is one optional step; the journey is the product.
4. **The journey.** Category → situation → safety → (check) → plan → person. Four categories, eleven situations, plans composed from steps that know the platform and the flags.
5. **Honesty by construction.** The model returns codes, never a verdict, never a number. The tier is decided by code. Every result ends with "Проверено / Не проверено". No "безопасно" anywhere.
6. **Privacy by construction.** No accounts. No incident data on the server. One image for one request, then deleted. Identity only as an expiring contact request at the moment of reaching a professional.
7. **What is real today.** The plans for all four categories, the signs cards, image analysis with local checks plus the model, link check with Safe Browsing and URLhaus, the bot, installable PWA, two languages.
8. **What is a prototype.** Demo directory cards, the contact request, helpline numbers only after a human verified them (say how many are verified by 14 Oct).
9. **What is next.** Scam-text rules in ru and tg with a labelled corpus and measured precision; a partner organisation receiving contact requests; Content Credentials validation; a school pilot with a research-ethics protocol.
10. **Ask.** One partner organisation in Tajikistan that can receive a teenager's request. One helpline that confirms its number.

Numbers for the deck, true on 13 Oct: 19 screens, 20 signs cards, 11 situations, 4 categories, 2 languages, 142 tests, 3 services, 0 child records on the server.

## 6. Known limits to say if asked

- The model is a vision model pointing at indicators; it is not a validated detector and we never claim it is.
- Content Credentials: presence detected, signature not yet validated.
- Tajik strings written by AI are marked until the native review lands; the review is in progress.
- Helpline numbers appear only after a team member called them.
- The blocklists cover known threats; a brand-new scam site is "nothing known", and the screen says so.
