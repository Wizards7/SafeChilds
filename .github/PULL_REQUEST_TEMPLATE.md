## What changed

<!-- 1-3 sentences. Which app/package, and why. -->

## Checklist

- [ ] **Scope respected** — nothing from the SKIP list in `docs/plans/0001-hackathon-scope.md` sneaks in without its re-add trigger firing
- [ ] **Honesty respected** — no invented professionals, phone numbers, accuracy percentages or confidence values; demo data is flagged `isDemo`; "safe" and "authentic" never appear
- [ ] **Tier is decided by code** — the model never chooses a tier or writes user-facing text
- [ ] **No child data persisted** — incidents and evidence stay on the device; the server stores no images, no URLs, no contact details outside an expiring request
- [ ] **Profile-driven** — a screen shows only what the situation profile matches
- [ ] **i18n** — every user-visible string exists in `ru` and `tg`; AI-written Tajik carries `VERIFY` until a native reviewed it
- [ ] **No secrets** — no keys/tokens in any committed file; `.env.example` updated in this PR if a var was added
