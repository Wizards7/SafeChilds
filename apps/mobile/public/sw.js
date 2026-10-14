/* SafeChilds service worker — hand-written (no build plugin; this app builds with Turbopack).
   - precache: the app shell routes + manifest + icons, then the JS/CSS each route references, so the guidance
     works in airplane mode after the first open
   - /_next/static: cache-first (hashed, immutable)
   - navigations: network-first, fall back to the cached page, then /offline
   - API calls (another origin) are never cached: analysis and directory results must be live or honestly unavailable
*/
const VERSION = "sc-v12";
const SHELL = [
  "/", "/welcome", "/situation", "/safety", "/urgent", "/question", "/stop", "/analyze", "/link",
  "/plan", "/feelings", "/breathe", "/people", "/request", "/incident", "/settings", "/privacy", "/offline",
  "/manifest.json", "/icons.svg?v=9", "/icon.svg",
  "/welcome/1.webp", "/welcome/2.webp", "/welcome/3.webp",
  "/home/fake_content.webp", "/home/extortion.webp", "/home/fraud.webp", "/home/cyberbullying.webp",
  "/situation/fake_photo.webp", "/situation/fake_video.webp", "/situation/impersonation.webp",
  "/feelings/person.webp", "/feelings/scared.webp", "/feelings/anxious.webp", "/feelings/angry.webp", "/feelings/sad.webp", "/feelings/ashamed.webp", "/feelings/overwhelmed.webp",
];

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
    event.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); return res; })));
    return;
  }

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(url.pathname, copy));
          return res;
        })
        .catch(async () => (await caches.match(url.pathname)) || (await caches.match("/offline")) || Response.error()),
    );
    return;
  }

  // Shell assets are keyed with their query (the sprite carries its version there, see components/Icon.tsx).
  if (SHELL.includes(url.pathname + url.search)) {
    event.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
  }
});
