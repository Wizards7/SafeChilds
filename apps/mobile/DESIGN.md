# `apps/mobile` — DESIGN

## Workflow (playbook method)

1. Tokens and foundation sheet first — done 2026-10-09: `assets/design/design-system/tokens.css` + `foundation.html` (gitignored staging; promoted to `packages/ui/` when the app is scaffolded).
2. One standalone HTML file per screen in `assets/design/mobile/`, opened on a real phone. Every file carries a state-switcher bar: normal / loading / empty / error / offline. Real `ru` + `tg` strings, never lorem ipsum.
3. Ideation pass with `taste-skill`; after approval every change is surgical in the file, never regenerated.
4. Approved files → `html.to.design` → one Figma file, the design home for the CRM and bot people.
5. The sketches' CSS becomes the app's styling foundation; nothing is thrown away.

## Journey graph

```
/language ─► /  (home) ─► /situation/[type] ─► /safety ─┬─ safe ──► /analyze (fake photo/video only, optional)
                                                         │                 │
                                                         │                 ▼
                                                         │            /feelings (optional) ─► /breathe (if offered)
                                                         │                 │
                                                         │                 ▼
                                                         │              /plan ─► /people ─► /incident
                                                         │
                                                         └─ threat / not sure / urgent ──► /urgent
```

Bottom nav is visible everywhere except `/breathe` and `/urgent`. Support in the nav opens `/feelings` directly for a teen who comes back later just to breathe.

## Screens (in build order)

| Order | Route | Why this order |
|---|---|---|
| 1 | `/` home | the demo starts here and it sets the tone |
| 2 | `/safety` | the screen a UNICEF jury will judge hardest |
| 3 | `/analyze` | four result states, the honesty contract made visible |
| 4 | `/plan` | the most useful screen in the app (exact report taps) |
| 5 | `/urgent` | must exist before any safety answer routes to it |
| 6 | `/people` | the directory with the DEMO banner |
| 7 | `/incident` | shows the journey paid off |
| 8 | `/feelings`, `/breathe` | support |
| 9 | `/language`, `/privacy` | small, last |

## Visual direction

Calm Trust: neutrals dominate, blue is the one primary action per screen, teal only on the human-support side, red only on the urgent screen. Icons are Lucide inline SVG. Warmth comes from copy and spacing, not from colour: "Что-то случилось?", not "Сообщить об инциденте".

Type scale (mobile): 28 / 22 / 18 / 16 / 14. Nothing under 14px. Inter, self-hosted woff2, Tajik glyphs verified on the foundation sheet.

## Desktop shell

At ≥ 768px the app renders inside a phone frame, centred, with the QR code, the one-line pitch and the "what is real / what is prototype" list beside it. This is the landing page. Below 768px the shell renders nothing.

## Open design questions

- Illustration or none on Home? Current answer: none for the hackathon; a warm headline does the job.
- Breathing visual: expanding circle (Calm pattern) or a plain timer? Current answer: circle, CSS only, respects `prefers-reduced-motion`.
