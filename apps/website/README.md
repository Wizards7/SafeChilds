# `apps/website` — the presentation landing

A one-page site for the jury and visitors: what happens to teenagers online, how the app answers each problem, privacy,
FAQ, and the way into the app. Built by Muhammadsodiq Gaziev (branch `landing`, 15d9fa1), merged on 2026-10-15 with the
fixes from a review. The product itself is the app in [`apps/mobile`](../mobile/README.md), whose laptop view stays its
own landing; this page is the pitch around it. Plan [`0001`](../../docs/plans/0001-hackathon-scope.md) records the
decision (§ 2, the Surface row).

## What is here

Plain HTML, CSS and JS, no build step and no `package.json`, so pnpm, Turborepo and the other apps' builds never see it.

- `index.html` — the page; `page.css` / `page.js` — its look and its scroll scenes; `scrollcraft.css` /
  `scrollcraft.js` — the scroll engine the scenes run on.
- `img/` — the app's own illustrations, screenshots of the deployed app (`app-*.jpg`), the QR (identical to
  `apps/mobile/public/qr.svg`) and `demo-face.jpg`: an AI-generated face (thispersondoesnotexist.com, nobody real), shown
  as the image-check example and in the concept feed, and named as AI-made next to both on the page.
- `fonts/` — Inter, self-hosted like the app (no request to Google Fonts): the latin, cyrillic and cyrillic-ext subsets
  of `@fontsource-variable/inter` 5.3.0, OFL (`fonts/LICENSE`).
- `Dockerfile` + `Caddyfile` — the Railway service.

The app's address lives in two places: every `href` in `index.html` (so links work before or without the scripts) and
`APP` in `page.js`. Change both, and the QR, if the app moves.

## Language

Russian only, Ali's call for the demo. `page.js` still holds a Tajik dictionary (`TG`), an AI draft nobody has
reviewed, and the page has no switch to reach it. Before Tajik goes on: a native review, the switch in the nav, and the
four wording fixes the Russian copy got on 2026-10-15, which `TG` does not have yet:

- `prP1T` — «Твой случай остаётся на телефоне» (it said everything stays on the phone; checks the kid starts do not);
- `a3` and `t1d` — the check gives no "real" or "fake" answer at all (it said no *guaranteed* answer) and shows
  *possible* signs;
- `qKicker` — the floating button is a concept for the next version, not «скоро».

`s1demo` and `qNote` (the AI-face notes) are new and have no Tajik yet.

## Run it

```
python3 -m http.server --directory apps/website 4180
```

or the real server: `docker build -f apps/website/Dockerfile -t sc-website . && docker run -e PORT=8080 -p 8080:8080 sc-website`.

## Deploy

Railway service `website`, built from the repo root like the other services: `RAILWAY_DOCKERFILE_PATH=apps/website/Dockerfile`,
watch path `apps/website/**`. Caddy serves only the page files, `img/` and `fonts/` (this README and the Docker files
return 404), compressed, with the app's security headers (`apps/mobile/next.config.ts`) minus the camera.

## Not merged from `landing`

The rendered videos (`apps/web/video/out`, 5.75 MB the page never loads), the video kit, the design notes and prompts,
and five unused images stay on that branch. The video kit's captions still need the "concept" label on the floating
button clips before they are shown publicly.
