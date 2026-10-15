# SafeChilds landing v2: brief

**Source of the brief.** Not a fresh interview. The user wrote a detailed design prompt (`apps/web/LANDING_PROMPT.md`) and, in chat (2026-10-14), asked for a version "как scroll-craft, чтобы при скроле был плавный переход и красивый", built next to v1 so the two can be compared. Where the prompt answers a topic it is quoted or cited; where it does not, the decision is marked **authored**.

Constraint from the user: write only inside `apps/web/` (this build lives in `apps/web/v2/`).

## The eight topics

1. **Vibe.** Prompt: «спокойной, современной и дружелюбной к подросткам», «Крупная редакционная типографика», «Смелая, но уравновешенная асимметрия», «Светлая основа и один насыщенный синий раздел». Chat: «плавный переход и красивый».
2. **Journey (prompt §4–6).** Hero with headline + example → «Что случилось?» four situations → blue «Не нужно решать всё сразу» → the plan («Понятно, что делать дальше») → «Первое сообщение уже легче начать» → other tools → privacy + prototype status → FAQ → final «Открыть приложение» with QR.
3. **Energy curve (authored, from the prompt's 0–5 / 5–15 / 15–30 s plan).** Calm open, a light lateral browse, one quiet held line, then the loudest act (the plan writing itself on blue), then calm, factual, quiet close.
4. **Feeling, stage by stage, and the one moment.** Prompt §1: «Подростку должно быть понятно, что здесь можно спокойно разобраться, с чего начать»; §6 scene 4 is «эмоциональный центр страницы: маленький конкретный мост к взрослому». The moment: the scary sentence turns into steps and then into words for an adult.
5. **What no other site does.** Prompt §5: «ситуация превращается в план… За одно взаимодействие посетитель должен понять, чем полезен продукт.» Seed of the signature move.
6. **Distance from premium-minimal.** Prompt §7 bans glass, glow, 3D shields, decorative ornaments. Stays near premium-minimal / editorial, light ground.
7. **One world or scenes.** Distinct scenes joined by one motif: «тонкая синяя линия маршрута… в трёх ключевых сценах». Not a worldflight.
8. **Assets.** Existing project illustrations only (`apps/mobile/public/home`, `welcome`, `feelings`, `icon.svg`, `qr.svg`). Flat blue line illustrations, so the world is **illustrated**, not photographic (worlds.md allows this when the brand is genuinely illustrated: the product UI uses these). No generation, no video, no spend.

## Journey

1. Recognition: «В интернете стало не по себе?» You are not the only one, and it starts with one step.
2. Range: these are the four things that happen (plus «не знаю»).
3. Quiet: «Не нужно решать всё сразу.» One held line before the peak.
4. Turn (peak): your sentence becomes a plan, then a message to an adult.
5. Substance: what else is there, honestly limited.
6. Trust: the case stays on your device; what is still a prototype.
7. Commitment: open the app (or scan on desktop).

## Feeling curve (written before the score)

| Act | Feeling | Caused by |
|---|---|---|
| Hero | recognised, calm | plain question in big type, the phone and a message bubble drifting at different depths |
| Situations | "that's mine" | lateral rail: four situations, each a picture + one line, plus «Не знаю» |
| Quiet line | relief, slowing down | white space and one sentence; the four stages of the path appear quietly |
| **Peak: plan** | control, then warmth | on blue: the bubble, the safety answer, three steps arriving and checking off, then the last step opening into the ready message |
| Tools | curiosity, honest | compact list, limits stated in the same breath |
| Privacy | safety, trust | teal plate wipes in; the prototype note at full contrast |
| FAQ | answered | big questions, short answers |
| Close | resolved, ready | the route line lands on the button; QR on desktop |

**Peak.** "I scrolled and the scary message turned into three steps, and then into a text I could send to my mom." Lives in act 4, the largest span on the page (5 viewport-heights), preceded by the quiet line.

**Tell-someone sentence.** "It's the site where you scroll and a frightening message turns into a plan and a ready text for an adult you trust."

**Authored silence.** Act 3 is deliberately sparse (one sentence, four small stages). It is not dead scroll.

## Grammar: Guided route (new, authored)

The page is one route with stops. Not filmic (no footage, and the visitor must be able to jump to «Помощь сейчас» and sections), not continuous world (would need a worldflight; the content is sections of text and FAQ), not live surface (the user's prompt asks for editorial headlines and a blue section, which live surface bans), not chaptered editorial (bans a fixed bar; «Помощь сейчас» must stay reachable), not poster (needs illustrations and a demo), not gallery (the range is only four items), not split stage (the argument is a sequence, not two sides), not cutlist (calm, not energy).

- **Nav:** a route rail. Desktop: fixed vertical rail on the left edge with clickable stops and a dot that travels with page scroll. Phone: the engine's thin progress line. Fixed top-right: language, «Помощь сейчас», «Открыть приложение».
- **Sequence:** stops along a route; the blue line motif appears in the hero, the peak, and the close.
- **Close:** arrival: the route ends on the CTA.
- **Bans:** `scrub`, `spotlight`, `magnet`, kinetic characters, card grids, centred copy in more than one act, more than one saturated ground.

## Signature move

**The plan writes itself.** In the pinned peak, page code reads the act's `--sc-p` and walks a labelled demo: the teen's sentence → the safety answer → three real steps from `packages/guidance` arrive and check off → «Расскажи взрослому» unfolds into the real ready message, with a working copy button. A situation switcher swaps the plan; on «Шантаж» the safety answer is «Мне угрожают» and the sheet becomes the real stop screen with the door to `/urgent` instead of a plan. Nothing is stored or sent.

## Score

| Act | Device | Why |
|---|---|---|
| 1 Hero | `parallax` (3 planes: route sweep, phone, bubble) in a flow section | depth without footage; copy rides at 1x |
| 2 Situations | `pan` (span 4.6) | lateral reads as "options" |
| 3 Quiet line | `flow` + `in` | the silence before the peak |
| 4 Peak | `pin` (span 5) + bespoke `--sc-p` script | the frame holds while the plan assembles |
| 5 Tools | `flow` + `in` | a document moment, short |
| 6 Privacy | `reveal` (up) on a teal plate | a change of state: "this is safe" |
| 7 FAQ | `flow` + `in` | plain answers |
| 8 Close | `pin` (span 1.3), hold cues | the page arrives and stops |

Families: parallax, pan, flow/in, pin, reveal (5). No family twice in a row. No scrub. ~15–16 viewport-heights, 8 acts.

## Deviations from the skill, and why

- The page sits at `v2/index.html` (not `builds/<name>/`): the user asked for "v2 next to v1".
- Inter for display and text (the project font, required by the prompt).
- Light canvas (prompt). No grain layer.
- Em dash rule kept for authored copy; strings quoted from `packages/guidance` keep their punctuation only where a dash is in the original and the string is shown verbatim.

## Update 2026-10-14: style from apps/web/DESIGN.md

After the plan above, the user added `apps/web/DESIGN.md` ("MindMarket" style reference) and, asked directly, chose «Да, по DESIGN.md». So the build wears that system: cream paper `#f5f1e4`, ink `#2c2e2a`, green `#8ed462` as the only structural accent (route line, nav dot, toggles, check marks), Inter weight 500 at extreme scale with -0.06em tracking, 50px radii, no shadows, white pill nav, light CTA pill with one blue dot, coral pill on situation cards, yellow footer band.

What changed against the plan:
- The left route rail moved into the white pill nav (DESIGN.md: "No sidebar").
- The peak ground is ink `#2c2e2a`, not the prompt's blue: DESIGN.md forbids accent colours as large fills, and white on sky-blue fails contrast.
- Kept outside DESIGN.md on purpose: the urgent red `#b91c1c` on «Помощь сейчас» and the stop screen (a safety signal, not decoration); stone text darkened to `#6b6d69` to pass 4.5:1 on cream.

## Update 2026-10-15: problem first, then the app's answer

The user asked (in Tajik) to start from section 2 with the problems, and then show and tell how the app solves each one. The «Что случилось?» chooser was replaced by two acts:

- **2 Problems** (`#problems`, pan 4.6): four problem cards. «Что это» and «почему ребёнок молчит» follow `packages/guidance` (`content/signs.ts`, ABOUT), shortened, not rewritten. The last card names the common problem: the kid stays alone with it.
- **3 Solution** (`#solution`, pin 4.4, bespoke `--sc-p`): one chapter per problem. The silent thought is struck out, then what the app does (from the guidance steps and the PRD) and the reviewed answer to that thought, with a real screenshot of the deployed PWA (`assets/app-fake.jpg`, `app-stop.jpg`, `app-link.jpg`, `app-bully.jpg`, captured 2026-10-15, Russian UI).

Sequence is now pan → pin → flow → pin (peak). The «не знаю» door moved to a link under the solution chapters.

## Update 2026-10-15: image check in the solution act

The image check (a staged training example) lives in chapter 1 of `#solution` («Поддельный контент»): the phone shows an HTML copy of the app's result screen. `assets/demo-face.jpg` is an AI-generated face from thispersondoesnotexist.com (nobody real). When the chapter opens it is scanned, two markers land (`face_boundary`, `background_warp`, real codes from `packages/analysis`), then the tier «Есть признаки возможной подделки» and «Где смотреть» appear, worded from `templates.ts`. No live `/analysis` call, never «фейк», no percentage. The peak («Пример») is back to four cards.
