import { describe, expect, it } from "vitest";
import { emptyProfile, type SituationId } from "@safechilds/guidance";
import type { Incident } from "./incident-store";
import { hasWork, resumeHref, startChoice } from "./next-step";

const at = "2026-10-15T08:00:00.000Z";
const kase = (situation: SituationId, extra: Partial<Incident> = {}): Incident => ({
  incidentKey: "k",
  profile: emptyProfile(situation),
  analysis: null,
  evidence: [],
  steps: {},
  chat: [],
  createdAt: at,
  updatedAt: at,
  ...extra,
});
const answered = (situation: SituationId) => ({ ...emptyProfile(situation), safety: "safe" as const });

describe("resumeHref", () => {
  it("a case that never answered the safety check continues at the safety check, never past it", () => {
    expect(resumeHref(emptyProfile("fake_photo"))).toBe("/safety");
  });
  it("a case past the safety check continues at the plan", () => {
    expect(resumeHref(answered("fake_photo"))).toBe("/plan");
  });
});

describe("startChoice", () => {
  it("no case: the tap starts one", () => {
    expect(startChoice(null, "fake_photo")).toBe("start");
  });

  it("the same situation continues the case, even one with saved work, and deletes nothing", () => {
    const withWork = kase("fake_photo", { evidence: [{ id: "e", createdAt: at, kind: "url", value: "https://example.com/p" }] });
    expect(startChoice(kase("fake_photo"), "fake_photo")).toBe("resume");
    expect(startChoice(withWork, "fake_photo")).toBe("resume");
  });

  it("another situation replaces an untouched case without asking", () => {
    expect(startChoice(kase("fake_photo"), "threat_to_publish")).toBe("start");
    expect(startChoice(kase("fake_photo", { profile: answered("fake_photo") }), "threat_to_publish")).toBe("start");
    expect(startChoice(kase("fake_photo", { steps: { "fc.save": { done: false, at } } }), "threat_to_publish")).toBe("start");
  });

  it("another situation asks first whenever something would be deleted", () => {
    const work: Partial<Incident>[] = [
      { evidence: [{ id: "e", createdAt: at, kind: "note", value: "он написал вчера" }] },
      { analysis: { tier: "inconclusive", originalMatches: false, evidence: [], markers: [], model: "skipped", at } },
      { steps: { "fc.save": { done: true, at } } },
      { chat: [{ id: "c", role: "me", text: "мне страшно", at }] },
      { feelings: [{ feeling: "scared", at }] },
      { breaths: [{ seconds: 60, at }] },
    ];
    for (const w of work) {
      expect(hasWork(kase("fake_photo", w)), JSON.stringify(Object.keys(w))).toBe(true);
      expect(startChoice(kase("fake_photo", w), "threat_to_publish"), JSON.stringify(Object.keys(w))).toBe("confirm");
    }
  });

  it("an older case without chat, feelings or breaths reads as untouched", () => {
    const old = kase("fake_photo");
    delete (old as Partial<Incident>).chat;
    expect(hasWork(old)).toBe(false);
  });
});
