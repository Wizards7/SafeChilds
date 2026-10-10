import { describe, expect, it } from "vitest";
import { emptyProfile } from "@safechilds/guidance";
import { fileReply, planMessage, questionMessage, safetyMessage, startMessage, stopMessage, urgentMessage } from "./render";

const APP = "https://app.example";

describe("bot renders the same guidance as the app", () => {
  it("start shows four categories plus 'не знаю' in both languages", () => {
    for (const locale of ["ru", "tg"] as const) {
      const m = startMessage(locale);
      expect(m.buttons).toHaveLength(5);
      expect(m.buttons[4]?.[0]?.data).toBe("sit:unknown");
    }
  });
  it("safety has four answers and the urgent message carries the category line", () => {
    expect(safetyMessage("ru").buttons).toHaveLength(4);
    const p = { ...emptyProfile("threat_to_publish"), safety: "threatened" as const };
    const u = urgentMessage(p, "ru", APP);
    expect(u.text).toContain("Ты не виноват(а).");
    expect(u.text).toContain("Это преступление против тебя");
    expect(u.buttons.flat().some((b) => b.url === `${APP}/?from=bot`)).toBe(true);
  });
  it("question → stop card → plan for extortion", () => {
    const p = emptyProfile("demand_money_or_photos");
    expect(questionMessage(p, "ru")?.text).toContain("заплатил");
    expect(stopMessage(p, "ru")?.text).toContain("Не плати");
    const plan = planMessage({ ...p, platform: "instagram", flags: { alreadyPaid: true } }, "ru", APP);
    expect(plan.text.split("\n")[1]).toContain("Не плати больше");
    expect(plan.text).toContain("Потом:");
  });
  it("plan offers the image check only for fake photo/video and the link check only for fraud", () => {
    expect(planMessage({ ...emptyProfile("fake_photo"), platform: "instagram" }, "tg", APP).buttons.flat().some((b) => b.url?.includes("from=bot"))).toBe(true);
    expect(planMessage({ ...emptyProfile("fake_photo"), platform: "instagram" }, "ru", APP).buttons.flat().some((b) => b.data === "link")).toBe(false);
  });
  it("files are judged by type and never claimed safe", () => {
    expect(fileReply("bank.apk", undefined, "ru")).toContain("Play Store");
    expect(fileReply("x.exe", undefined, "ru")).toContain("программа");
    expect(fileReply("report.pdf", undefined, "ru")).toContain("макросы");
    expect(fileReply("a.zip", undefined, "ru")).toContain("Архив");
    for (const f of ["bank.apk", "x.exe", "report.pdf", "a.zip", "y.txt"]) expect(fileReply(f, undefined, "ru").toLowerCase()).not.toContain("безопас");
  });
});
