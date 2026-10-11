import { describe, expect, it } from "vitest";
import type { Db } from "@safechilds/db";
import { analyzeImage, describeError, type AnalysisDeps, type ModelClient } from "./service";

const db = { insert: () => ({ values: async () => undefined }) } as unknown as Db;
const image = { bytes: Buffer.from("png"), mime: "image/png" };

function deps(model: ModelClient | null) {
  const warnings: string[] = [];
  const d: AnalysisDeps = { db, model, log: { warn: (m) => warnings.push(m) } };
  return { d, warnings };
}

describe("describeError", () => {
  it("names the error, its HTTP status and a short message, nothing else", () => {
    const apiError = Object.assign(new Error("invalid x-api-key"), { name: "AuthenticationError", status: 401 });
    expect(describeError(apiError)).toBe("AuthenticationError 401: invalid x-api-key");
    expect(describeError(new Error("timeout"))).toBe("Error: timeout");
    expect(describeError("boom")).toBe("Error");
    expect(describeError(null)).toBe("Error");
    expect(describeError(Object.assign(new Error("x".repeat(500)), { name: "APIError" }))).toHaveLength("APIError: ".length + 160);
  });
});

describe("analyzeImage logs why the model path failed", () => {
  it("a rejected key shows up as its status in the warning and the tier is unavailable", async () => {
    const { d, warnings } = deps({ describe: async () => { throw Object.assign(new Error("invalid x-api-key"), { name: "AuthenticationError", status: 401 }); } });
    const decision = await analyzeImage(d, image, []);
    expect(decision.tier).toBe("unavailable");
    expect(warnings).toEqual(["model call failed: AuthenticationError 401: invalid x-api-key"]);
  });
  it("an unparseable reply is reported as a validation failure", async () => {
    const { d, warnings } = deps({ describe: async () => '{"indicators": "not a list"}' });
    expect((await analyzeImage(d, image, [])).tier).toBe("unavailable");
    expect(warnings[0]).toMatch(/^model response failed validation: /);
  });
  it("a valid empty reply is inconclusive and logs nothing", async () => {
    const { d, warnings } = deps({ describe: async () => 'Here: {"indicators": []}' });
    expect((await analyzeImage(d, image, [])).tier).toBe("inconclusive");
    expect(warnings).toEqual([]);
  });
});
