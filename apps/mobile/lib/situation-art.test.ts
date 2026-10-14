import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { SITUATION_CATEGORY, SITUATIONS } from "@safechilds/guidance";
import { SITUATION_ART } from "./situation-art";

// A situation tile breaks silently in four ways: a missing title or description in one language, a missing picture,
// a picture whose real size no longer matches the box the page reserves for it (the art gets swapped), or a picture
// the service worker never caches (blank tile offline). Each is checked against the real files.

const file = (rel: string) => new URL(`../${rel}`, import.meta.url);
const messages = (locale: "ru" | "tg") => JSON.parse(readFileSync(file(`messages/${locale}.json`), "utf8"));
const sw = readFileSync(file("public/sw.js"), "utf8");

// The canvas size of an extended WebP (VP8X chunk: 24-bit little-endian width - 1 and height - 1). Pictures with
// transparency are always extended WebP.
function webpSize(bytes: Buffer): [number, number] {
  expect(bytes.toString("ascii", 0, 4)).toBe("RIFF");
  expect(bytes.toString("ascii", 8, 12)).toBe("WEBP");
  expect(bytes.toString("ascii", 12, 16)).toBe("VP8X");
  return [bytes.readUIntLE(24, 3) + 1, bytes.readUIntLE(27, 3) + 1];
}

const ids = Object.keys(SITUATION_ART) as (keyof typeof SITUATION_ART)[];

describe("situation tile art", () => {
  // The page shows tiles only when a whole category has art; a half-done category would quietly stay on the old rows.
  it("a category with any art has art for every one of its situations", () => {
    const categories = new Set(ids.map((id) => SITUATION_CATEGORY[id]));
    for (const c of categories) {
      const missing = SITUATIONS.filter((s) => SITUATION_CATEGORY[s] === c && !SITUATION_ART[s]);
      expect(missing, c).toEqual([]);
    }
  });

  for (const id of ids) {
    it(`${id}: title and description in ru and tg, the picture at its declared size, precached`, () => {
      for (const locale of ["ru", "tg"] as const) {
        const tile = messages(locale).situation.tile[id];
        expect(tile?.t, `${locale} ${id}.t`).toBeTruthy();
        expect(tile?.d, `${locale} ${id}.d`).toBeTruthy();
      }
      const path = `public/situation/${id}.webp`;
      expect(existsSync(file(path)), path).toBe(true);
      expect(webpSize(readFileSync(file(path)))).toEqual(SITUATION_ART[id]);
      expect(sw).toContain(`"/situation/${id}.webp"`);
    });
  }
});
