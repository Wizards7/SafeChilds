import { describe, expect, it } from "vitest";
import { ITEMS, composePlan, emptyProfile, matches, questionFor, stopCardFor } from "./index";

describe("showWhen", () => {
  const p = { ...emptyProfile("fake_photo"), platform: "instagram" as const, flags: { ongoing: true } };
  it("matches category, situation, platform, flags, and combinators", () => {
    expect(matches({ category: "fake_content" }, p)).toBe(true);
    expect(matches({ situation: ["fake_video", "fake_photo"] }, p)).toBe(true);
    expect(matches({ platform: "tiktok" }, p)).toBe(false);
    expect(matches({ flag: "ongoing" }, p)).toBe(true);
    expect(matches({ flag: "alreadyPaid" }, p)).toBe(false);
    expect(matches({ not: { platform: "instagram" } }, p)).toBe(false);
    expect(matches({ all: [{ category: "fake_content" }, { any: [{ platform: "vk" }, { flag: "ongoing" }] }] }, p)).toBe(true);
  });
  it("never matches on a null field", () => {
    expect(matches({ safety: "safe" }, emptyProfile("fake_photo"))).toBe(false);
  });
});

describe("composePlan", () => {
  it("shows only the platform's report step and splits three now / rest later", () => {
    const p = { ...emptyProfile("fake_photo"), platform: "instagram" as const };
    const plan = composePlan(ITEMS, p);
    const ids = [...plan.now, ...plan.later].map((s) => s.id);
    expect(ids).toContain("fake.report.instagram");
    expect(ids).not.toContain("fake.report.tiktok");
    expect(ids).toContain("fake.restrict.instagram");
    expect(ids).not.toContain("fake.block");
    expect(plan.now).toHaveLength(3);
    expect(plan.later.length).toBeGreaterThan(0);
  });
  it("shows everything when four or fewer steps match", () => {
    const p = emptyProfile("fake_photo"); // no platform → no report step, no restrict/block split
    const plan = composePlan(ITEMS, p);
    expect(plan.now.length + plan.later.length).toBeLessThanOrEqual(5);
  });
  it("moves 'tell an adult' to the front when the kid is threatened", () => {
    const threatened = { ...emptyProfile("threat_to_publish"), safety: "threatened" as const };
    const calm = { ...emptyProfile("threat_to_publish"), safety: "safe" as const };
    expect(composePlan(ITEMS, threatened).now.map((s) => s.id)).toContain("ext.tell_adult_early");
    expect(composePlan(ITEMS, calm).now.map((s) => s.id)).not.toContain("ext.tell_adult_early");
    expect([...composePlan(ITEMS, calm).now, ...composePlan(ITEMS, calm).later].map((s) => s.id)).toContain("ext.tell_adult");
  });
  it("adds the already-paid branch only with the flag", () => {
    const paid = { ...emptyProfile("demand_money_or_photos"), flags: { alreadyPaid: true } };
    expect(composePlan(ITEMS, paid).now[0]?.id).toBe("ext.already_paid");
    expect(composePlan(ITEMS, emptyProfile("demand_money_or_photos")).now[0]?.id).not.toBe("ext.already_paid");
  });
});

describe("category pieces", () => {
  it("has a stop card only for extortion and a question per category", () => {
    expect(stopCardFor(ITEMS, emptyProfile("threat_to_publish"))?.id).toBe("ext.stop");
    expect(stopCardFor(ITEMS, emptyProfile("fake_photo"))).toBeNull();
    expect(questionFor(ITEMS, emptyProfile("fake_photo"))?.id).toBe("fake.analyze");
    expect(questionFor(ITEMS, emptyProfile("threat_to_publish"))?.id).toBe("ext.paid");
  });
  it("every string exists in both languages", () => {
    const texts: { ru: string; tg: string }[] = [];
    for (const item of ITEMS) {
      if (item.kind === "step") texts.push(item.title, ...[item.how, item.why, item.message].filter((t): t is NonNullable<typeof t> => !!t));
      if (item.kind === "question") texts.push(item.text, ...item.answers.map((a) => a.label));
      if (item.kind === "stop") texts.push(item.title, item.note, ...item.lines);
      if (item.kind === "urgent") texts.push(item.text);
    }
    for (const t of texts) {
      expect(t.ru.trim()).not.toBe("");
      expect(t.tg.trim()).not.toBe("");
    }
  });
});
