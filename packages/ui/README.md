# `packages/ui` — tokens, stylesheet, icons

Promoted from the design sketches on 2026-10-10 (`assets/design/design-system/tokens.css`, `assets/design/mobile/sketch.css`, `icons.svg`). The sketches stay the place to try things; when a change is approved there, it is copied here. Same names, same values.

- `tokens.css` — colours, type scale, radius, spacing, focus outline. Light only.
- `app.css` — layout, buttons, options, cards, chips, steps, nav, help button, fields, badges, markers, directory card, evidence rows, grids, segmented control, consent row, breathing ring, stop list, skeleton. Sketch-only parts (state switcher, `ru`/`tg` span toggling) were left out: the app renders one language and real state.
- `icons.svg` — one Lucide sprite. Use `<svg class="i"><use href="/icons.svg#name"/></svg>`; the app copies the sprite into `public/`.
- Font: Inter, self-hosted through `@fontsource-variable/inter` in the app (no runtime CDN). Tajik glyphs verified on the foundation sheet.

No React here. Components with logic live in the app.
