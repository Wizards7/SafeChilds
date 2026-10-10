import { describe, expect, it } from "vitest";
import { decideLinkTier, isShortener, lookalike } from "./links";

describe("links", () => {
  it("flags lookalikes and leaves the real domain alone", () => {
    expect(lookalike("alif-tj.com")?.kind).toBe("lookalike");
    expect(lookalike("bonus.alif.tj.site")?.kind).toBe("lookalike");
    expect(lookalike("alif.tj")).toBeNull();
    expect(lookalike("app.alif.tj")).toBeNull();
    expect(lookalike("example.org")).toBeNull();
  });
  it("knows shorteners", () => {
    expect(isShortener("bit.ly")).toBe(true);
    expect(isShortener("alif.tj")).toBe(false);
  });
  it("a blocklist hit is 'known_dangerous'; findings are 'signs'; nothing is never 'safe'", () => {
    expect(decideLinkTier({ findings: [{ kind: "blocklist", source: "urlhaus" }, { kind: "shortener", host: "bit.ly", finalHost: "x.y" }], sourcesFailed: false })).toBe("known_dangerous");
    expect(decideLinkTier({ findings: [{ kind: "young_domain", host: "x.y", ageDays: 4 }], sourcesFailed: true })).toBe("signs");
    expect(decideLinkTier({ findings: [], sourcesFailed: false })).toBe("nothing_known");
    expect(decideLinkTier({ findings: [], sourcesFailed: true })).toBe("unavailable");
  });
});
