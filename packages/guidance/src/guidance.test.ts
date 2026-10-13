import { describe, expect, it } from "vitest";
import { ABOUT, ITEMS, SIGN_CATEGORIES, SIGNS, cardMarkers, composePlan, emptyProfile, markerNumbers, matches, questionFor, splitMarkers, stopCardFor, type Profile } from "./index";

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

describe("fraud", () => {
  it("offers the link check only when a profile asks for money or a code, and no stop card", () => {
    const asks = emptyProfile("profile_asks_money_or_code");
    const q = questionFor(ITEMS, asks);
    expect(q?.id).toBe("fraud.link");
    expect(q?.answers.find((a) => a.id === "yes")?.next).toBe("link");
    expect(questionFor(ITEMS, emptyProfile("already_sent"))).toBeNull();
    expect(stopCardFor(ITEMS, asks)).toBeNull();
    expect(stopCardFor(ITEMS, emptyProfile("already_sent"))).toBeNull();
  });
  it("splits the two doors: nothing sent vs already sent", () => {
    const asks = composePlan(ITEMS, emptyProfile("profile_asks_money_or_code"));
    const asksIds = [...asks.now, ...asks.later].map((s) => s.id);
    expect(asks.now[0]?.id).toBe("fraud.dont_send");
    expect(asksIds).not.toContain("fraud.bank");
    expect(asksIds).toContain("fraud.tell_adult");

    const sent = composePlan(ITEMS, emptyProfile("already_sent"));
    const sentIds = [...sent.now, ...sent.later].map((s) => s.id);
    expect(sent.now.map((s) => s.id)).toEqual(["fraud.dont_send_more", "fraud.bank", "fraud.passwords"]);
    expect(sentIds).not.toContain("fraud.dont_send");
    expect(sentIds).toContain("fraud.tell_adult_now");
    expect(sentIds).toContain("fraud.police");
  });
  it("the alreadySent flag opens the already-sent door from the other situation", () => {
    const p = { ...emptyProfile("profile_asks_money_or_code"), flags: { alreadySent: true } };
    expect(composePlan(ITEMS, p).now[0]?.id).toBe("fraud.dont_send_more");
  });
  it("shows only the platform's report step", () => {
    const p = { ...emptyProfile("profile_asks_money_or_code"), platform: "telegram" as const };
    const ids = [...composePlan(ITEMS, p).now, ...composePlan(ITEMS, p).later].map((s) => s.id);
    expect(ids).toContain("fraud.report.telegram");
    expect(ids).not.toContain("fraud.report.instagram");
  });
});

describe("cyberbullying", () => {
  it("asks the one question and sets ongoing", () => {
    const q = questionFor(ITEMS, emptyProfile("group_against_me"));
    expect(q?.id).toBe("cb.ongoing");
    expect(q?.answers.find((a) => a.id === "ongoing")?.sets).toEqual({ ongoing: true });
    expect(stopCardFor(ITEMS, emptyProfile("group_against_me"))).toBeNull();
  });
  it("moves 'tell an adult' to step 2 when ongoing, keeps it later otherwise", () => {
    const ongoing = { ...emptyProfile("persistent_messages"), safety: "safe" as const, flags: { ongoing: true } };
    const once = { ...emptyProfile("persistent_messages"), safety: "safe" as const };
    expect(composePlan(ITEMS, ongoing).now[1]?.id).toBe("cb.tell_adult_early");
    expect(composePlan(ITEMS, once).now.map((s) => s.id)).not.toContain("cb.tell_adult_early");
    expect([...composePlan(ITEMS, once).now, ...composePlan(ITEMS, once).later].map((s) => s.id)).toContain("cb.tell_adult");
  });
  it("adds the group step only for a group and the photo step only for public humiliation", () => {
    const ids = (s: Parameters<typeof emptyProfile>[0]) => {
      const plan = composePlan(ITEMS, emptyProfile(s));
      return [...plan.now, ...plan.later].map((x) => x.id);
    };
    expect(ids("group_against_me")).toContain("cb.group");
    expect(ids("persistent_messages")).not.toContain("cb.group");
    expect(ids("public_humiliation")).toContain("cb.photo");
    expect(ids("group_against_me")).not.toContain("cb.photo");
  });
  it("restricts on Instagram and blocks elsewhere", () => {
    const ig = { ...emptyProfile("persistent_messages"), platform: "instagram" as const };
    const tg = { ...emptyProfile("persistent_messages"), platform: "telegram" as const };
    const idsOf = (p: Profile) => [...composePlan(ITEMS, p).now, ...composePlan(ITEMS, p).later].map((s) => s.id);
    expect(idsOf(ig)).toContain("cb.restrict.instagram");
    expect(idsOf(ig)).not.toContain("cb.block");
    expect(idsOf(tg)).toContain("cb.block");
    expect(idsOf(tg)).toContain("cb.report.telegram");
  });
});

describe("every situation has a plan", () => {
  it("no Home tile and no «не знаю» door reaches an empty plan", () => {
    for (const s of ["fake_photo", "fake_video", "impersonation", "threat_to_publish", "demand_money_or_photos", "profile_asks_money_or_code", "already_sent", "public_humiliation", "persistent_messages", "group_against_me", "unknown"] as const) {
      const plan = composePlan(ITEMS, emptyProfile(s));
      expect(plan.now.length, s).toBeGreaterThanOrEqual(3);
    }
  });
  it("«не знаю» gets the four steps that hold for any situation, with its own ready message", () => {
    const plan = composePlan(ITEMS, emptyProfile("unknown"));
    expect(plan.now.map((s) => s.id)).toEqual(["unknown.dont_send", "unknown.save", "unknown.dont_reply", "unknown.tell_adult"]);
    expect(plan.later).toEqual([]);
    expect(plan.now.find((s) => s.id === "unknown.tell_adult")?.message?.ru).toMatch(/что-то случилось/);
    expect(plan.now.every((s) => s.title.ru && s.title.tg)).toBe(true);
  });
  it("item ids are unique", () => {
    const ids = ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("learn-the-signs cards", () => {
  it("has five cards per category, unique ids, and a marker for every sign in both languages", () => {
    const ids: string[] = [];
    for (const c of SIGN_CATEGORIES) {
      expect(SIGNS[c], c).toHaveLength(5);
      for (const card of SIGNS[c]) {
        ids.push(card.id);
        const expected = card.signs.map((_, i) => i + 1);
        expect(cardMarkers(card, "ru"), card.id).toEqual(expected);
        expect(cardMarkers(card, "tg"), card.id).toEqual(expected);
        if (card.mock.kind === "photo") {
          expect(card.mock.lines).toHaveLength(0);
          expect(card.signs.length).toBeLessThanOrEqual(4);
        } else {
          expect(card.mock.lines.length).toBeGreaterThan(0);
        }
        for (const text of [card.title, ...card.signs, ...card.mock.lines.map((l) => l.text)]) {
          expect(text.ru.trim()).not.toBe("");
          expect(text.tg.trim()).not.toBe("");
        }
      }
      expect(ABOUT[c].what.ru.trim()).not.toBe("");
      expect(ABOUT[c].what.tg.trim()).not.toBe("");
      expect(ABOUT[c].silent.length).toBeGreaterThanOrEqual(3);
    }
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("splits marker tokens out of a line", () => {
    expect(splitMarkers("Привет [1], это ты? [2]")).toEqual(["Привет ", 1, ", это ты? ", 2]);
    expect(splitMarkers("[фото Мадины]")).toEqual(["[фото Мадины]"]);
    expect(markerNumbers("[3] a [1]")).toEqual([3, 1]);
  });
});
