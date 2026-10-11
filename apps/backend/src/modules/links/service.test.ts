import { describe, expect, it } from "vitest";
import { checkLink, type LinkDeps } from "./service";

type Opts = { redirectTo?: string; registered?: string; rdapFails?: boolean; headFails?: boolean; calls?: string[] };

function fakeFetch(opts: Opts): LinkDeps["fetch"] {
  return (async (input: string | URL | Request, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    opts.calls?.push(url);
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
const resolve = async (h: string): Promise<string[]> => {
  if (h === "evil.example") return ["10.1.2.3"];
  if (h === "dual.example") return ["93.184.216.34", "fd00::1"];
  return ["93.184.216.34"];
};
const deps = (opts: Opts = {}, blocklists: LinkDeps["blocklists"] = []): LinkDeps => ({ fetch: fakeFetch(opts), now, resolve, blocklists });
const listed = (name: "urlhaus" | "safe_browsing", answer: boolean | Error): LinkDeps["blocklists"][number] => ({
  name,
  lookup: async () => {
    if (answer instanceof Error) throw answer;
    return answer;
  },
});

describe("checkLink", () => {
  it("expands a shortener, flags the lookalike behind it and a young domain → signs", async () => {
    const r = await checkLink(deps({ redirectTo: "https://alif-tj.com/bonus", registered: "2026-10-06T00:00:00Z" }), "https://bit.ly/abc");
    expect(r.tier).toBe("signs");
    expect(r.finalUrl).toBe("https://alif-tj.com/bonus");
    expect(r.findings.map((f) => f.kind).sort()).toEqual(["asks_for_code_or_payment", "lookalike", "shortener", "young_domain"].sort());
    expect(r.checked).toEqual(["destination", "lookalike", "age"]);
    expect(r.unchecked).toEqual(["blocklists"]);
  });
  it("the real bank domain with an old registration → nothing_known, never 'safe'", async () => {
    const r = await checkLink(deps({ registered: "2015-01-01T00:00:00Z" }), "https://alif.tj/");
    expect(r.tier).toBe("nothing_known");
    expect(r.findings).toEqual([]);
  });
  it("all external sources failing → unavailable; a deterministic finding still wins; both sources reported unchecked", async () => {
    const failed = await checkLink(deps({ headFails: true, rdapFails: true }), "https://example.org/x");
    expect(failed.tier).toBe("unavailable");
    expect(failed.checked).toEqual(["lookalike"]);
    expect(failed.unchecked.sort()).toEqual(["age", "blocklists", "destination"]);
    expect((await checkLink(deps({ headFails: true, rdapFails: true }), "https://example.org/x")).tier).toBe("unavailable");
    expect((await checkLink(deps({ headFails: true, rdapFails: true }), "https://alif-tj.com/x")).tier).toBe("signs");
  });
  it("an RDAP answer without a registration date leaves the age unchecked", async () => {
    const r = await checkLink(deps({}), "https://example.org/");
    expect(r.unchecked).toContain("age");
    expect(r.checked).toContain("destination");
  });
  it("garbage input → unavailable, no throw", async () => {
    const g = await checkLink(deps(), "not a url");
    expect(g.tier).toBe("unavailable");
    expect(g.checked).toEqual([]);
    expect((await checkLink(deps(), "javascript:alert(1)")).tier).toBe("unavailable");
  });
});

describe("checkLink never reaches an internal address", () => {
  it.each([
    "http://127.0.0.1/",
    "http://10.0.0.5/x",
    "http://169.254.169.254/latest/meta-data",
    "http://[::1]/",
    "http://[::ffff:127.0.0.1]/",
    "http://backend.railway.internal/",
    "http://localhost:4100/",
    "http://postgres/",
    "http://evil.example/login",
    "http://dual.example/",
  ])("%s → unavailable without a single request", async (u) => {
    const calls: string[] = [];
    const r = await checkLink(deps({ calls }), u);
    expect(r.tier).toBe("unavailable");
    expect(r.findings).toEqual([]);
    expect(calls).toEqual([]);
  });
  it("stops at the last public hop when a redirect points inside", async () => {
    const calls: string[] = [];
    const r = await checkLink(deps({ calls, redirectTo: "http://169.254.169.254/latest", registered: "2015-01-01T00:00:00Z" }), "https://example.org/go");
    expect(r.finalUrl).toBe("https://example.org/go");
    expect(r.tier).toBe("nothing_known");
    expect(calls.some((c) => c.includes("169.254"))).toBe(false);
  });
  it("stops at the last public hop when a redirect leaves the web", async () => {
    const calls: string[] = [];
    const r = await checkLink(deps({ calls, redirectTo: "file:///etc/passwd", registered: "2015-01-01T00:00:00Z" }), "https://example.org/go");
    expect(r.finalUrl).toBe("https://example.org/go");
    expect(calls.some((c) => c.startsWith("file:"))).toBe(false);
  });
});

describe("checkLink with blocklists", () => {
  it("a hit on any list → known_dangerous with the list named, blocklists checked", async () => {
    const r = await checkLink(deps({ registered: "2015-01-01T00:00:00Z" }, [listed("safe_browsing", false), listed("urlhaus", true)]), "https://example.org/x");
    expect(r.tier).toBe("known_dangerous");
    expect(r.findings).toEqual([{ kind: "blocklist", source: "urlhaus" }]);
    expect(r.checked).toContain("blocklists");
  });
  it("lists that answer 'not listed' leave nothing_known but count as checked", async () => {
    const r = await checkLink(deps({ registered: "2015-01-01T00:00:00Z" }, [listed("urlhaus", false)]), "https://example.org/x");
    expect(r.tier).toBe("nothing_known");
    expect(r.checked).toEqual(["destination", "lookalike", "age", "blocklists"]);
    expect(r.unchecked).toEqual([]);
  });
  it("a list that fails is unchecked and logged by name; with every source failing the tier is unavailable", async () => {
    const warnings: string[] = [];
    const d = { ...deps({ registered: "2015-01-01T00:00:00Z" }, [listed("urlhaus", Object.assign(new Error("forbidden"), { status: 403 }))]), log: { warn: (m: string) => warnings.push(m) } };
    const r = await checkLink(d, "https://example.org/x");
    expect(r.tier).toBe("nothing_known");
    expect(r.unchecked).toEqual(["blocklists"]);
    expect(warnings).toEqual(["blocklist urlhaus failed: Error 403: forbidden"]);
    const all = await checkLink(deps({ headFails: true, rdapFails: true }, [listed("urlhaus", new Error("down"))]), "https://example.org/x");
    expect(all.tier).toBe("unavailable");
    expect(all.unchecked.sort()).toEqual(["age", "blocklists", "destination"]);
  });
  it("without a configured list, blocklists stay unchecked", async () => {
    const r = await checkLink(deps({ registered: "2015-01-01T00:00:00Z" }), "https://example.org/x");
    expect(r.unchecked).toEqual(["blocklists"]);
  });
});
