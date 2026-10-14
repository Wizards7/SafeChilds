import { describe, expect, it } from "vitest";
import type { Evidence } from "./incident-store";
import { TAKEN_MIN_AGE_MS, dayKey, entriesOf, groupByDay, relativeDay, shortUrl, stripDays, takenAt } from "./timeline";

// Local wall-clock dates, so the tests hold in any time zone the suite runs in.
const at = (d: number, h = 12, m = 0) => new Date(2026, 9, d, h, m);
const iso = (d: number, h = 12, m = 0) => at(d, h, m).toISOString();

const link: Evidence = { id: "l1", createdAt: iso(13, 18, 32), kind: "url", value: "https://instagram.com/p/C8x" };
const check: Evidence = { id: "c1", createdAt: iso(13, 18, 40), kind: "imageCheck", tier: "indicators", facts: [], originalMatches: false };
const shotOld: Evidence = { id: "s1", createdAt: iso(14, 9, 0), kind: "screenshot", value: new Blob(), takenAt: iso(12, 21, 5) };
const shotNew: Evidence = { id: "s2", createdAt: iso(14, 12, 14), kind: "screenshot", value: new Blob() };

describe("takenAt", () => {
  it("keeps a file date that is clearly older than the moment it was added", () => {
    expect(takenAt(at(12).getTime(), at(14).getTime())).toBe(at(12).toISOString());
  });
  it("drops a file date that is just the pick time, or missing, so the card says added", () => {
    const now = at(14).getTime();
    expect(takenAt(now - TAKEN_MIN_AGE_MS + 1, now)).toBeUndefined();
    expect(takenAt(0, now)).toBeUndefined();
    expect(takenAt(Number.NaN, now)).toBeUndefined();
  });
});

describe("entriesOf", () => {
  it("puts saved items and finished steps on one timeline, newest first, a screenshot on the day it was taken", () => {
    const entries = entriesOf({
      evidence: [link, check, shotOld, shotNew],
      steps: { "fake.report.instagram": { done: true, at: iso(14, 12, 20) }, "fake.screenshot": { done: false, at: iso(14, 12, 25) } },
    });
    expect(entries.map((e) => e.key)).toEqual(["s-fake.report.instagram", "e-s2", "e-c1", "e-l1", "e-s1"]);
  });
  it("leaves out unticked steps and step ids the catalogue no longer has", () => {
    const entries = entriesOf({ evidence: [], steps: { "fake.screenshot": { done: false, at: iso(14) }, "gone.step": { done: true, at: iso(14) } } });
    expect(entries).toEqual([]);
  });
});

describe("groupByDay", () => {
  it("groups by the local day in order, newest day first", () => {
    const days = groupByDay(entriesOf({ evidence: [link, check, shotOld, shotNew], steps: {} }));
    expect(days.map((d) => [d.key, d.entries.length])).toEqual([["2026-10-14", 1], ["2026-10-13", 2], ["2026-10-12", 1]]);
  });
  it("splits at local midnight", () => {
    const late: Evidence = { ...link, id: "a", createdAt: iso(13, 23, 59) };
    const early: Evidence = { ...link, id: "b", createdAt: iso(14, 0, 1) };
    expect(groupByDay(entriesOf({ evidence: [late, early], steps: {} })).map((d) => d.key)).toEqual(["2026-10-14", "2026-10-13"]);
  });
});

describe("relativeDay", () => {
  it("names today and yesterday, and nothing else", () => {
    expect(relativeDay(at(14, 0, 5), at(14, 23))).toBe("today");
    expect(relativeDay(at(13, 23, 55), at(14, 0, 1))).toBe("yesterday");
    expect(relativeDay(at(12), at(14))).toBeNull();
  });
});

describe("stripDays", () => {
  it("runs Monday to Sunday of this week, marks active days, greys the future", () => {
    const days = stripDays(new Set(["2026-10-12", "2026-10-14"]), at(14));
    expect(days.map((d) => d.key)).toEqual(["2026-10-12", "2026-10-13", "2026-10-14", "2026-10-15", "2026-10-16", "2026-10-17", "2026-10-18"]);
    expect(days.filter((d) => d.active).map((d) => d.key)).toEqual(["2026-10-12", "2026-10-14"]);
    expect(days.filter((d) => d.future).length).toBe(4);
  });
  it("starts at the Monday of the earliest active week, never further back than the cap", () => {
    expect(stripDays(new Set(["2026-10-07"]), at(14))[0]?.key).toBe("2026-10-05");
    expect(stripDays(new Set(["2025-01-01"]), at(14), 14)[0]?.key).toBe("2026-09-28");
  });
});

describe("dayKey and shortUrl", () => {
  it("formats the local day and shortens an address to host + path", () => {
    expect(dayKey(at(4))).toBe("2026-10-04");
    expect(shortUrl("https://www.instagram.com/p/C8x/?igsh=abc")).toBe("www.instagram.com/p/C8x/");
    expect(shortUrl("https://alif-tj.com/")).toBe("alif-tj.com");
    expect(shortUrl("not a url")).toBe("not a url");
  });
});
