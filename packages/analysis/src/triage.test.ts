import { describe, expect, it } from "vitest";
import { crisisLevel, parseTriage, rulesTriage, STEP_TITLES, TRIAGE_PROMPT } from "./triage";

describe("crisisLevel", () => {
  it("self-harm words are urgent, threats are threatened, the rest is null, in both languages", () => {
    expect(crisisLevel("я больше не хочу жить")).toBe("urgent");
    expect(crisisLevel("Худкушӣ мекунам")).toBe("urgent");
    expect(crisisLevel("он угрожает разослать фото")).toBe("threatened");
    expect(crisisLevel("ӯ таҳдид мекунад")).toBe("threatened");
    expect(crisisLevel("мне прислали ссылку на бонус")).toBeNull();
  });
  it("the rules answer routes to urgent with no items and no model", () => {
    const r = rulesTriage("urgent");
    expect(r).toMatchObject({ status: "ok", source: "rules", safety: "urgent", route: "urgent", items: [] });
    expect(rulesTriage("threatened")).toMatchObject({ safety: "threatened", flags: ["threatened"] });
  });
});

describe("parseTriage", () => {
  it("accepts codes, drops unknown step ids, derives the category from the situation, forces urgent routes", () => {
    const r = parseTriage('Sure: {"safety":"ok","category":"fraud","situation":"profile_asks_money_or_code","flags":[],"platform":"telegram","items":["fraud.dont_send","made.up","fraud.save","fraud.dont_send"],"route":"plan","confidence":"high"}');
    expect(r?.items).toEqual(["fraud.dont_send", "fraud.save"]);
    const many = parseTriage('{"safety":"ok","category":"fraud","situation":null,"flags":[],"platform":null,"items":["fraud.dont_send","fraud.save","fraud.block","fraud.warn_friend","fraud.tell_adult"],"route":"plan","confidence":"low"}');
    expect(many?.items).toHaveLength(3);
    expect(r?.category).toBe("fraud");
    const wrongCat = parseTriage('{"safety":"ok","category":"extortion","situation":"persistent_messages","flags":[],"platform":null,"items":[],"route":"plan","confidence":"high"}');
    expect(wrongCat?.category).toBe("cyberbullying");
    const threat = parseTriage('{"safety":"threatened","category":null,"situation":null,"flags":[],"platform":null,"items":[],"route":"plan","confidence":"low"}');
    expect(threat?.route).toBe("urgent");
  });
  it("rejects prose, bad enums and missing fields", () => {
    expect(parseTriage("I think this is fraud")).toBeNull();
    expect(parseTriage('{"safety":"maybe","route":"plan","confidence":"high"}')).toBeNull();
    expect(parseTriage('{"safety":"ok","confidence":"high"}')).toBeNull();
  });
  it("the prompt lists every step id and never asks for text", () => {
    for (const id of STEP_TITLES.keys()) expect(TRIAGE_PROMPT).toContain(`- ${id}:`);
    expect(TRIAGE_PROMPT).toContain("CODES ONLY");
    expect(STEP_TITLES.size).toBeGreaterThan(30);
  });
  it("never offers or passes through a step that waits for a VERIFY (Take It Down leaked through the chat, 2026-10-14)", () => {
    expect(TRIAGE_PROMPT).not.toContain("take_it_down");
    expect(TRIAGE_PROMPT).not.toContain("VERIFY");
    const r = parseTriage('{"safety":"ok","category":"extortion","situation":"threat_to_publish","flags":["intimate"],"platform":null,"items":["ext.take_it_down","ext.evidence"],"route":"plan","confidence":"high"}');
    expect(r?.items).toEqual(["ext.evidence"]);
  });
});
