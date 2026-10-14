import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
import { CATEGORIES, SIGN_CATEGORIES } from "@safechilds/guidance";

// The service worker can't run in the preview pane, so this runs the real public/sw.js unchanged against a small fake
// browser: Cache Storage keyed by absolute URL (query included, fragment dropped, as the real one matches by default), a
// network that can go offline or answer an error, and the install / activate / fetch events. Every page the fake network
// serves says which URL it is and whether it came at install ("install …") or on a later online visit ("visit …"), so a
// test sees exactly which copy came back offline and where an online visit was stored.

const ORIGIN = "https://app.test";
const SOURCE = readFileSync(new URL("../public/sw.js", import.meta.url), "utf8");
const PAGE_CATEGORIES = CATEGORIES.filter((c) => c !== "unknown");

type Key = string | { url: string };
type Handler = (event: Record<string, unknown>) => void;

function boot() {
  const stores = new Map<string, Map<string, Response>>();
  const keyOf = (k: Key) => {
    const u = new URL(typeof k === "string" ? k : k.url, ORIGIN);
    u.hash = "";
    return u.href;
  };
  const store = (name: string) => {
    let s = stores.get(name);
    if (!s) stores.set(name, (s = new Map()));
    return s;
  };
  // Options such as ignoreSearch would change what matches; the worker must not rely on any this fake does not model.
  const noOptions = (options: unknown) => {
    if (options !== undefined) throw new Error(`cache match options are not modelled: ${JSON.stringify(options)}`);
  };
  let online = true;
  let phase = "install";
  let failNext: number | null = null;
  const network = async (input: Key) => {
    if (!online) throw new TypeError("Failed to fetch");
    const url = new URL(typeof input === "string" ? input : input.url, ORIGIN);
    const status = failNext ?? 200;
    failNext = null;
    return new Response(`${status === 200 ? "" : `${status} `}${phase} ${url.pathname}${url.search}`, { status, headers: { "content-type": "text/html" } });
  };
  const cache = (name: string) => ({
    put: async (k: Key, res: Response) => void store(name).set(keyOf(k), res),
    match: async (k: Key, options?: unknown) => (noOptions(options), store(name).get(keyOf(k))?.clone()),
    add: async (k: Key) => {
      const res = await network(k);
      if (!res.ok) throw new TypeError("add: not ok");
      store(name).set(keyOf(k), res);
    },
  });
  const caches = {
    open: async (name: string) => cache(name),
    keys: async () => [...stores.keys()],
    delete: async (name: string) => stores.delete(name),
    match: async (k: Key, options?: unknown) => {
      noOptions(options);
      for (const s of stores.values()) {
        const hit = s.get(keyOf(k));
        if (hit) return hit.clone();
      }
      return undefined;
    },
  };
  const handlers = new Map<string, Handler>();
  const self = {
    location: new URL(`${ORIGIN}/sw.js`),
    addEventListener: (type: string, h: Handler) => handlers.set(type, h),
    skipWaiting: async () => undefined,
    clients: { claim: async () => undefined },
  };
  runInNewContext(SOURCE, { self, caches, fetch: network, Response, URL, Promise, Set, console });

  const lifecycle = async (type: "install" | "activate") => {
    let done: unknown;
    handlers.get(type)?.({ waitUntil: (p: unknown) => (done = p) });
    await done;
  };
  // A full-page load of `path`, as the browser does when the app's own link fetch fails offline.
  const open = async (path: string) => {
    let reply: Promise<Response> | undefined;
    handlers.get("fetch")?.({ request: { method: "GET", url: `${ORIGIN}${path}`, mode: "navigate" }, respondWith: (p: Promise<Response>) => (reply = p) });
    if (!reply) throw new Error(`the worker did not answer ${path}`);
    const res = await reply;
    await new Promise((r) => setTimeout(r, 0)); // the copy of an online page is stored after the reply
    return res.type === "error" ? "network error" : res.text();
  };
  return {
    open,
    async install() {
      await lifecycle("install");
      await lifecycle("activate");
      phase = "visit";
    },
    goOffline: () => void (online = false),
    answerNextWith: (status: number) => void (failNext = status),
  };
}

async function installed() {
  const sw = boot();
  await sw.install();
  return sw;
}

describe("service worker offline", () => {
  it("each category's «Что именно случилось?» opens as itself; an online visit refreshes only its own copy", async () => {
    const sw = await installed();
    expect(await sw.open("/situation?c=extortion")).toBe("visit /situation?c=extortion");
    sw.goOffline();
    for (const c of PAGE_CATEGORIES) {
      expect(await sw.open(`/situation?c=${c}`)).toBe(`${c === "extortion" ? "visit" : "install"} /situation?c=${c}`);
    }
  });

  it("a category it never cached gets the offline page, never another category's", async () => {
    const sw = await installed();
    await sw.open("/situation?c=fraud");
    sw.goOffline();
    expect(await sw.open("/situation?c=somewhere_else")).toBe("install /offline");
    expect(await sw.open("/situation")).toBe("install /offline");
  });

  it("the chat and the signs open offline, each signs category as itself", async () => {
    const sw = await installed();
    await sw.open("/signs?c=fraud");
    sw.goOffline();
    expect(await sw.open("/chat")).toBe("install /chat");
    expect(await sw.open("/signs")).toBe("install /signs");
    for (const c of SIGN_CATEGORIES) expect(await sw.open(`/signs?c=${c}`)).toBe(`${c === "fraud" ? "visit" : "install"} /signs?c=${c}`);
  });

  it("an error answer online (a 5xx during a deploy) never replaces the cached page", async () => {
    const sw = await installed();
    sw.answerNextWith(502);
    expect(await sw.open("/situation?c=extortion")).toBe("502 visit /situation?c=extortion");
    sw.goOffline();
    expect(await sw.open("/situation?c=extortion")).toBe("install /situation?c=extortion");
  });

  it("a page outside QUERY_PAGES keeps one copy per path, whatever its query", async () => {
    const sw = await installed();
    await sw.open("/people?urgent=1");
    sw.goOffline();
    expect(await sw.open("/people")).toBe("visit /people?urgent=1");
    expect(await sw.open("/people?review=1")).toBe("visit /people?urgent=1");
    expect(await sw.open("/breathe?from=feelings")).toBe("install /breathe");
    expect(await sw.open("/?from=qr")).toBe("install /");
  });
});
