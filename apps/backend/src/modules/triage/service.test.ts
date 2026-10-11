import { describe, expect, it } from "vitest";
import { triage, type TextModelClient } from "./service";

const warnings: string[] = [];
const log = { warn: (m: string) => warnings.push(m) };
const model = (raw: string | Error): TextModelClient => ({
  reply: async () => {
    if (raw instanceof Error) throw raw;
    return raw;
  },
});

describe("triage", () => {
  it("self-harm words go to urgent by rules without touching the model", async () => {
    let called = false;
    const r = await triage({ model: { reply: async () => { called = true; return "{}"; } }, log }, ["я не хочу жить"]);
    expect(r).toMatchObject({ status: "ok", source: "rules", safety: "urgent", route: "urgent" });
    expect(called).toBe(false);
  });
  it("a crisis sentence in an earlier turn does not force the latest turn to urgent", async () => {
    const r = await triage({ model: model('{"safety":"ok","category":"fraud","situation":"profile_asks_money_or_code","flags":[],"platform":null,"items":["fraud.dont_send"],"route":"plan","confidence":"high"}'), log }, ["я не хочу жить", "мне пишет человек из банка и просит код"]);
    expect(r).toMatchObject({ status: "ok", source: "model", route: "plan" });
  });
  it("a valid model answer becomes codes; a threat word raises safety even if the model said ok", async () => {
    const ok = await triage({ model: model('{"safety":"ok","category":"fraud","situation":"already_sent","flags":["alreadySent"],"platform":"telegram","items":["fraud.bank","fraud.passwords"],"route":"plan","confidence":"high"}'), log }, ["отправил код из смс человеку из банка"]);
    expect(ok).toMatchObject({ status: "ok", source: "model", situation: "already_sent", items: ["fraud.bank", "fraud.passwords"], route: "plan" });
    const raised = await triage({ model: model('{"safety":"ok","category":"extortion","situation":"threat_to_publish","flags":[],"platform":null,"items":[],"route":"plan","confidence":"high"}'), log }, ["он угрожает разослать фото"]);
    expect(raised).toMatchObject({ safety: "threatened", route: "urgent", flags: ["threatened"] });
  });
  it("no model, prose, or an error → failed, logged without the text", async () => {
    expect(await triage({ model: null, log }, ["привет"])).toEqual({ status: "failed" });
    warnings.length = 0;
    expect(await triage({ model: model("I cannot classify this"), log }, ["секретный текст"])).toEqual({ status: "failed" });
    expect(await triage({ model: model(Object.assign(new Error("boom"), { status: 500 })), log }, ["секретный текст"])).toEqual({ status: "failed" });
    expect(warnings).toEqual(["triage response failed validation", "triage call failed: Error 500: boom"]);
    expect(warnings.join(" ")).not.toContain("секретный");
  });
});
