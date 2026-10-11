import { describe, expect, it } from "vitest";
import { configuredBlocklists, safeBrowsing, urlhaus } from "./blocklists";

type Call = { url: string; init: RequestInit };

function fakeFetch(reply: (c: Call) => Response, calls: Call[] = []) {
  const f = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const c = { url, init: init ?? {} };
    calls.push(c);
    return reply(c);
  }) as typeof fetch;
  return { f, calls };
}

const target = new URL("https://alif-tj.com/login?code=1#top");

describe("safeBrowsing", () => {
  it("posts the URL without its fragment and reads matches", async () => {
    const { f, calls } = fakeFetch(() => new Response(JSON.stringify({ matches: [{ threatType: "SOCIAL_ENGINEERING" }] }), { status: 200 }));
    expect(await safeBrowsing(f, "KEY").lookup(target)).toBe(true);
    expect(calls[0]?.url).toBe("https://safebrowsing.googleapis.com/v4/threatMatches:find?key=KEY");
    expect(calls[0]?.init.method).toBe("POST");
    const body = JSON.parse(String(calls[0]?.init.body));
    expect(body.threatInfo.threatEntries).toEqual([{ url: "https://alif-tj.com/login?code=1" }]);
    expect(body.threatInfo.threatEntryTypes).toEqual(["URL"]);
  });
  it("an empty object means not listed; an HTTP error throws", async () => {
    expect(await safeBrowsing(fakeFetch(() => new Response("{}", { status: 200 })).f, "K").lookup(target)).toBe(false);
    await expect(safeBrowsing(fakeFetch(() => new Response("", { status: 403 })).f, "K").lookup(target)).rejects.toThrow("403");
  });
});

describe("urlhaus", () => {
  it("posts a form with the Auth-Key header and maps query_status", async () => {
    const { f, calls } = fakeFetch(() => new Response(JSON.stringify({ query_status: "ok", url_status: "online" }), { status: 200 }));
    expect(await urlhaus(f, "AUTH").lookup(target)).toBe(true);
    expect(calls[0]?.url).toBe("https://urlhaus-api.abuse.ch/v1/url/");
    expect((calls[0]?.init.headers as Record<string, string>)["Auth-Key"]).toBe("AUTH");
    expect(String(calls[0]?.init.body)).toBe("url=https%3A%2F%2Falif-tj.com%2Flogin%3Fcode%3D1");
    expect(await urlhaus(fakeFetch(() => new Response(JSON.stringify({ query_status: "no_results" }), { status: 200 })).f, "A").lookup(target)).toBe(false);
    await expect(urlhaus(fakeFetch(() => new Response(JSON.stringify({ query_status: "invalid_url" }), { status: 200 })).f, "A").lookup(target)).rejects.toThrow("invalid_url");
  });
});

describe("configuredBlocklists", () => {
  it("builds only the lists that have a key", () => {
    const f = fakeFetch(() => new Response("{}")).f;
    expect(configuredBlocklists(f, {}).map((b) => b.name)).toEqual([]);
    expect(configuredBlocklists(f, { URLHAUS_AUTH_KEY: "x" }).map((b) => b.name)).toEqual(["urlhaus"]);
    expect(configuredBlocklists(f, { SAFE_BROWSING_API_KEY: "y", URLHAUS_AUTH_KEY: "x" }).map((b) => b.name)).toEqual(["safe_browsing", "urlhaus"]);
  });
});
