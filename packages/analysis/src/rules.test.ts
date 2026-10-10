import { describe, expect, it } from "vitest";
import { decideTier } from "./rules";

const m = { code: "face_boundary" as const, x: 0.4, y: 0.3 };

describe("decideTier — the honesty contract", () => {
  it("verifiable evidence wins over everything", () => {
    expect(decideTier({ evidence: ["original_differs"], markers: [], model: "failed" }).tier).toBe("evidence");
    expect(decideTier({ evidence: ["exif_contradiction"], markers: [m], model: "ok" }).tier).toBe("evidence");
  });
  it("model markers alone give 'indicators', never 'evidence'", () => {
    expect(decideTier({ evidence: ["exif_stripped"], markers: [m], model: "ok" }).tier).toBe("indicators");
  });
  it("neutral facts never raise the tier", () => {
    expect(decideTier({ evidence: ["exif_stripped", "c2pa_absent"], markers: [], model: "ok" }).tier).toBe("inconclusive");
  });
  it("a failed model with nothing local is 'unavailable'; a skipped model is 'inconclusive'", () => {
    expect(decideTier({ evidence: [], markers: [], model: "failed" }).tier).toBe("unavailable");
    expect(decideTier({ evidence: [], markers: [], model: "skipped" }).tier).toBe("inconclusive");
  });
  it("'original matches' is a finding, not a tier", () => {
    const d = decideTier({ evidence: ["original_matches"], markers: [], model: "skipped" });
    expect(d.originalMatches).toBe(true);
    expect(d.tier).toBe("inconclusive");
  });
  it("never outputs a number", () => {
    const d = decideTier({ evidence: [], markers: [m], model: "ok" });
    expect(Object.values(d).some((v) => typeof v === "number")).toBe(false);
  });
});
