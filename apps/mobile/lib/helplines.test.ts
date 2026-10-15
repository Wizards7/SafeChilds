import { describe, expect, it } from "vitest";
import { urgentHelplines } from "./helplines";

// Shapes as directory.helplines returns them. The numbers are test fixtures, not real lines.
const line = (id: string, categories: string[], verified = true, number: string | null = "000") => ({
  id,
  number,
  categories,
  verifiedAt: verified ? "2026-10-15T00:00:00.000Z" : null,
});

const police = line("police", ["extortion"]);
const trust = line("mvd-trust", ["extortion", "fraud"]);
const national = line("national-trust", ["extortion", "cyberbullying", "fake_content"]);
const centre = line("violence-centre", ["extortion", "cyberbullying"]);
const all = [trust, national, police, centre];
const ids = (xs: { id: string }[]) => xs.map((x) => x.id);

describe("urgentHelplines", () => {
  it("a threatened bullied kid still sees the police and the МВД line, after the bullying lines", () => {
    expect(ids(urgentHelplines(all, "cyberbullying"))).toEqual(["national-trust", "violence-centre", "mvd-trust", "police"]);
  });

  it("every category sees every verified line; only the order changes", () => {
    for (const c of ["fake_content", "extortion", "fraud", "cyberbullying"] as const) {
      expect(ids(urgentHelplines(all, c)).sort(), c).toEqual(ids(all).sort());
    }
    expect(ids(urgentHelplines(all, "fraud")).slice(0, 1)).toEqual(["mvd-trust"]);
  });

  it("a case without a category keeps the API's order", () => {
    expect(ids(urgentHelplines(all, "unknown"))).toEqual(ids(all));
  });

  it("a line nobody verified, or one without a number, never shows", () => {
    const unverified = line("unverified", ["cyberbullying"], false);
    const noNumber = line("no-number", ["cyberbullying"], true, null);
    expect(ids(urgentHelplines([unverified, noNumber, police], "cyberbullying"))).toEqual(["police"]);
  });
});
