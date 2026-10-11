import { describe, expect, it } from "vitest";
import { coverageLine, IMAGE_CHECK_TEXT, imageCoverage, LINK_SOURCE_TEXT, LINK_SOURCES } from "./coverage";

describe("imageCoverage", () => {
  it("a full run with an original and a model answer checks everything", () => {
    const c = imageCoverage({ evidence: ["exif_stripped", "c2pa_absent", "original_differs"], model: "ok" });
    expect(c.checked).toEqual(["metadata", "c2pa", "original", "model"]);
    expect(c.unchecked).toEqual([]);
  });
  it("no original and a failed model are reported as unchecked", () => {
    const c = imageCoverage({ evidence: ["exif_present", "c2pa_absent"], model: "failed" });
    expect(c.checked).toEqual(["metadata", "c2pa"]);
    expect(c.unchecked).toEqual(["original", "model"]);
  });
  it("a Content Credentials manifest that was not validated is an unchecked signature", () => {
    expect(imageCoverage({ evidence: ["exif_stripped", "c2pa_present_unverified"], model: "ok" }).unchecked).toEqual(["c2pa_signature", "original"]);
    expect(imageCoverage({ evidence: ["c2pa_declares_edited"], model: "ok" }).checked).toContain("c2pa_signature");
  });
  it("a stored decision without a model field counts the model as unchecked", () => {
    expect(imageCoverage({ evidence: [] }).unchecked).toEqual(["metadata", "c2pa", "original", "model"]);
  });
});

describe("coverageLine", () => {
  it("writes both halves, drops an empty one, in both languages", () => {
    const c = { checked: ["destination", "lookalike"] as const, unchecked: ["age", "blocklists"] as const };
    expect(coverageLine({ checked: [...c.checked], unchecked: [...c.unchecked] }, LINK_SOURCE_TEXT, "ru")).toBe(
      "Проверено: куда ведёт ссылка, похожесть на известные сайты. Не проверено: возраст домена, списки опасных сайтов.",
    );
    expect(coverageLine({ checked: [...LINK_SOURCES], unchecked: [] }, LINK_SOURCE_TEXT, "tg")).toMatch(/^Санҷида шуд: .+\.$/);
    expect(coverageLine({ checked: [], unchecked: ["model"] }, IMAGE_CHECK_TEXT, "ru")).toBe("Не проверено: признаки на изображении.");
  });
});
