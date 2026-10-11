import { describe, expect, it } from "vitest";
import { emptyProfile } from "@safechilds/guidance";
import { defang, fileReply, hiddenLink, linkReply, planMessage, questionMessage, safetyMessage, startMessage, stopMessage, triageMessage, urgentMessage } from "./render";

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
  it("start carries the never-ask line with the official username when known", () => {
    expect(startMessage("ru", "SafeChildsBot").text).toContain("@SafeChildsBot");
    expect(startMessage("tg", "SafeChildsBot").text).toContain("@SafeChildsBot");
    expect(startMessage("ru").text).not.toContain("@");
  });
  it("links in replies are never tappable and a hidden link is called out", () => {
    expect(defang("alif-tj.com")).toBe("alif-tj[.]com");
    const h = hiddenLink({ type: "text_link", text: "alif.tj", url: "https://alif-tj.com/login" });
    expect(h).toEqual({ shown: "alif.tj", real: "alif-tj.com" });
    expect(hiddenLink({ type: "text_link", text: "https://alif.tj/", url: "https://alif.tj/promo" })).toBeNull();
    expect(hiddenLink({ type: "text_link", text: "нажми сюда", url: "https://x.example" })).toBeNull();
    expect(hiddenLink({ type: "url", text: "https://x.example" })).toBeNull();
    const reply = linkReply({ tier: "signs", finalUrl: "https://alif-tj.com/login?code=1", checked: ["destination", "lookalike", "age"], unchecked: ["blocklists"] }, h, "ru");
    expect(reply).toContain("alif-tj[.]com");
    expect(reply).toContain("Проверено: куда ведёт ссылка, похожесть на известные сайты, возраст домена. Не проверено: списки опасных сайтов.");
    expect(linkReply({ tier: "unavailable", finalUrl: null }, null, "ru")).toContain("Не проверено: куда ведёт ссылка, похожесть на известные сайты, возраст домена, списки опасных сайтов.");
    expect(reply).toContain("alif[.]tj");
    expect(reply).not.toMatch(/https?:\/\//);
    expect(reply).not.toContain("code=1");
    expect(linkReply({ tier: "unavailable", finalUrl: null }, null, "tg")).not.toContain("[.]");
    // The probe failed: the pasted link's own host is still shown, defanged, and only the host.
    const noProbe = linkReply({ tier: "nothing_known", finalUrl: null }, null, "ru", "http://zagonka8.zagonkom.gb.net/104860-film.html");
    expect(noProbe).toContain("Ведёт на: zagonka8[.]zagonkom[.]gb[.]net");
    expect(noProbe).not.toContain("104860");
  });
  it("an APK named like a photo or an invitation gets the disguise warning", () => {
    expect(fileReply("Свадьба_приглашение.apk", undefined, "ru")).toContain("маскируют");
    expect(fileReply("сурат.jpg.apk", undefined, "tg")).toContain("Play Store");
    expect(fileReply("bank.apk", undefined, "ru")).not.toContain("маскируют");
  });
  it("free text that became codes shows step titles and a confirm button; nothing matched shows the start buttons", () => {
    const m = triageMessage({ situation: "already_sent", category: "fraud", items: ["fraud.bank", "fraud.passwords"], route: "plan" }, "ru");
    expect(m.text).toContain("• Позвони в банк и заблокируй карту");
    expect(m.text).toContain("Я уже отправил(а) деньги или код");
    expect(m.buttons[0]?.[0]?.data).toBe("sit:already_sent");
    const none = triageMessage({ situation: null, category: null, items: [], route: "ask" }, "tg");
    expect(none.buttons).toHaveLength(5);
    const cat = triageMessage({ situation: null, category: "cyberbullying", items: [], route: "ask" }, "ru");
    expect(cat.buttons.flat().some((b) => b.data === "sit:group_against_me")).toBe(true);
  });
});
