/* SafeChilds service worker — hand-written (no build plugin; this app builds with Turbopack).
   - precache: the app shell routes + manifest + icons, then the JS/CSS each route references, so the guidance
     works in airplane mode after the first open
   - /_next/static: cache-first (hashed, immutable)
   - navigations: network-first, fall back to the cached page, then /offline; a page whose server render depends on its
     query (QUERY_PAGES) is cached and found with that query, so offline it never shows another category's copy
   - API calls (another origin) are never cached: analysis and directory results must be live or honestly unavailable
*/
// sc-v15, not sc-v14: the tile branches still say sc-v14, so whichever lands later conflicts here and picks its own name.
const VERSION = "sc-v15";
const SHELL = [
  "/", "/welcome", "/safety", "/urgent", "/question", "/stop", "/analyze", "/link",
  "/plan", "/feelings", "/breathe", "/people", "/request", "/incident", "/settings", "/privacy", "/offline", "/chat", "/signs",
  "/situation?c=fake_content", "/situation?c=extortion", "/situation?c=fraud", "/situation?c=cyberbullying",
  "/signs?c=fake_content", "/signs?c=extortion", "/signs?c=fraud", "/signs?c=cyberbullying",
  "/manifest.json", "/icons.svg?v=9", "/icon.svg",
  "/welcome/1.webp", "/welcome/2.webp", "/welcome/3.webp",
  "/home/fake_content.webp", "/home/extortion.webp", "/home/fraud.webp", "/home/cyberbullying.webp",
  "/situation/fake_photo.webp", "/situation/fake_video.webp", "/situation/impersonation.webp",
  "/situation/threat_to_publish.webp", "/situation/demand_money_or_photos.webp",
  "/feelings/person.webp", "/feelings/scared.webp", "/feelings/anxious.webp", "/feelings/angry.webp", "/feelings/sad.webp", "/feelings/ashamed.webp", "/feelings/overwhelmed.webp",
];

// Pages the server renders from their query (?c=<category>): one cached copy per query, looked up with it and never
// swapped for another category's copy (2026-10-14: offline, «Травля» could open extortion's page). Every other page keeps
// one copy per path: its query is either ignored (?from=qr) or read again in the browser (?urgent=, ?from=feelings),
// which re-renders that copy from the URL. The bare /situation is not precached: nothing links to it.
const QUERY_PAGES = ["/situation", "/signs"];
const pageKey = (url) => (QUERY_PAGES.includes(url.pathname) ? url.pathname + url.search : url.pathname);

async function precache() {
  const cache = await caches.open(VERSION);
  await Promise.all(
    SHELL.map(async (url) => {
      try {
        const res = await fetch(url, { credentials: "same-origin" });
        if (!res.ok) return;
        await cache.put(url, res.clone());
        if (!url.startsWith("/_") && !url.includes(".")) {
          // warm the route's own chunks so an unvisited route still renders offline
          const html = await res.text();
          const assets = [...html.matchAll(/(?:src|href)="(\/_next\/static\/[^"]+)"/g)].map((m) => m[1]);
          await Promise.all([...new Set(assets)].map((a) => cache.add(a).catch(() => {})));
        }
      } catch {
        /* offline during install: the next online open fills the cache */
      }
    }),
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); } return res; })));
    return;
  }

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // Only a real page replaces the cached copy: a 5xx during a deploy or a redirect must not overwrite it.
          if (res.ok && !res.redirected) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(pageKey(url), copy));
          }
          return res;
        })
        .catch(async () => (await caches.match(pageKey(url))) || (await caches.match("/offline")) || Response.error()),
    );
    return;
  }

  // Shell assets are keyed with their query (the sprite carries its version there, see components/Icon.tsx).
  if (SHELL.includes(url.pathname + url.search)) {
    event.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
  }
});
