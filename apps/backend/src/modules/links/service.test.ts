import { describe, expect, it } from "vitest";
import { checkLink, type LinkDeps } from "./service";

function fakeFetch(opts: { redirectTo?: string; registered?: string; rdapFails?: boolean; headFails?: boolean }): LinkDeps["fetch"] {
  return (async (input: string | URL | Request, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (url.startsWith("https://rdap.org/")) {
      if (opts.rdapFails) throw new Error("rdap down");
      return new Response(JSON.stringify({ events: opts.registered ? [{ eventAction: "registration", eventDate: opts.registered }] : [] }), { status: 200 });
    }
    if (init?.method === "HEAD") {
      if (opts.headFails) throw new Error("no network");
      if (opts.redirectTo) return new Response(null, { status: 302, headers: { location: opts.redirectTo } });
      return new Response(null, { status: 200 });
    }
    return new Response(null, { status: 404 });
  }) as LinkDeps["fetch"];
}

const now = () => new Date("2026-10-10T12:00:00Z");

describe("checkLink", () => {
  it("expands a shortener, flags the lookalike behind it and a young domain → signs", async () => {
    const r = await checkLink({ fetch: fakeFetch({ redirectTo: "https://alif-tj.com/bonus", registered: "2026-10-06T00:00:00Z" }), now }, "https://bit.ly/abc");
    expect(r.tier).toBe("signs");
    expect(r.finalUrl).toBe("https://alif-tj.com/bonus");
    expect(r.findings.map((f) => f.kind).sort()).toEqual(["asks_for_code_or_payment", "lookalike", "shortener", "young_domain"].sort());
  });
  it("the real bank domain with an old registration → nothing_known, never 'safe'", async () => {
    const r = await checkLink({ fetch: fakeFetch({ registered: "2015-01-01T00:00:00Z" }), now }, "https://alif.tj/");
    expect(r.tier).toBe("nothing_known");
    expect(r.findings).toEqual([]);
  });
  it("all external sources failing → unavailable; a deterministic finding still wins", async () => {
    expect((await checkLink({ fetch: fakeFetch({ headFails: true, rdapFails: true }), now }, "https://example.org/x")).tier).toBe("unavailable");
    expect((await checkLink({ fetch: fakeFetch({ headFails: true, rdapFails: true }), now }, "https://alif-tj.com/x")).tier).toBe("signs");
  });
  it("garbage input → unavailable, no throw", async () => {
    expect((await checkLink({ fetch: fakeFetch({}), now }, "not a url")).tier).toBe("unavailable");
    expect((await checkLink({ fetch: fakeFetch({}), now }, "javascript:alert(1)")).tier).toBe("unavailable");
  });
});
