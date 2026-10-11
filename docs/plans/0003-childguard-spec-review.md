# 0003 — Review of the team's ChildGuard SPEC v3

**Status:** Approved 2026-10-11 (supplements 0001; 0001 still wins on scope)
**Source:** a team member's "ChildGuard — SPEC v3" (1,118 lines, kept outside git in `assets/docs/doc/`). A full anti-scam
scanner: Python backend, Flutter app, aiogram bot, ClamAV, malware feeds, APK static analysis, OCR, QR, an evidence
aggregator, workers, an admin panel. Honest in the same way SafeChilds is: the model never gives a verdict, a missing EXIF
is never a sign, "no signs found" never means "safe".

## Decision

Not adopted as the spec. It answers "is this file or link dangerous?" (case 06) for a two-month build in a stack we locked
out. SafeChilds answers "a fake was made about me, what now?" (case 05) in three days. Mined for the pieces below.

## Adopted, shipped 2026-10-11

| Piece | Where |
|---|---|
| The link check never contacts an internal address: private, loopback, link-local, CGNAT, multicast, metadata, `.internal`/`.local`/single-label names, as the pasted link or behind a redirect; non-web redirect targets stop the chain | `apps/backend/src/modules/links/ssrf.ts`, `service.ts`, tests |
| The bot checks `text_link` entities by their real address and says when the visible text shows another site (the hidden link) | `apps/bot/src/render.ts` `hiddenLink`, `bot.ts` |
| No tappable link in a bot reply: only the destination host, written `example[.]com`; never the full URL | `render.ts` `defang`, `linkReply` |
| `/start` after the language pick: "we never ask for codes, passwords or money", with the bot's own @username | `render.ts` `startMessage` |
| An APK named like a photo, document or invitation (ru/tg words, VERIFY with native speakers) gets the "this is a program, not an invitation" wording | `render.ts` `fileReply` |
| A "Проверено / Не проверено" line under every image and link result, derived from the signals (metadata, Content Credentials, original, model; destination, lookalike, age, blocklists), shared by the app and the bot. Blocklists always read "не проверено" until they are wired | `packages/analysis/src/coverage.ts`, `Decision.model`, `LinkResult.checked/unchecked`, both result screens, `linkReply` |

Known limit, recorded in `ssrf.ts`: the name is resolved once and fetched by name afterwards, so DNS rebinding between the
two is not caught; acceptable for a bodiless HEAD, revisit at pilot with a pinned-address agent.

## Adopted for the pilot, not code now

- Rules-based scam-text signals in ru and tg (code requests, "поддержка Telegram", Premium/Stars gifts, votes, "a relative needs money") with a labelled corpus, hard negatives, two native annotators, and precision/recall per language.
- An "I already installed the app" help path (disable internet, remove special rights, uninstall, change passwords from another device).
- Per-check consent before anything leaves the phone, instead of one notice.
- A written threat model: SSRF, parser bombs, the service as an oracle, fake copies of the bot.

## Rejected, one line each

- Stack switch (Python, Flutter, aiogram, Redis, workers): locked in 0001, nothing to gain before the demo.
- Server-side file scanning (download, ClamAV, APK parsing, 24 h reports, history, share tokens): breaks "no child data on the server" and the "files judged by type only" decision.
- Admin panel, feeds, reputation database, group mode, Flutter app: a pilot's worth of surface.
- Renaming the four tiers to red/orange/yellow/green with emoji: the tiers already carry the honesty, the demo is rehearsed on them, and the house has no emoji.
- "SPEC.md as the single source of truth": 0001 stays the authority.
