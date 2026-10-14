import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { composePlan, emptyProfile, ITEMS, PLATFORMS, platformMatters, questionFor, SAFETY_ANSWERS, SITUATION_CATEGORY, SITUATIONS, type Profile, type SituationId } from "@safechilds/guidance";
import { NO_UNSURE, SITUATION_ART } from "./situation-art";

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

// NO_UNSURE hides «Не уверен(а)» where a "don't know" case costs more than any tile. These pin the reasons, not the list:
// when a reason stops holding, the test fails and the row can come back.
describe("«Не уверен(а)» is hidden only where it costs the kid real help", () => {
  const planIds = (p: Profile) => {
    const plan = composePlan(ITEMS, p);
    return [...plan.now, ...plan.later].map((step) => step.id);
  };

  it("extortion: both tiles give the same plan, so picking either loses nothing", () => {
    expect(NO_UNSURE.has("extortion")).toBe(true);
    expect(planIds(emptyProfile("threat_to_publish")).sort()).toEqual(planIds(emptyProfile("demand_money_or_photos")).sort());
  });

  it("cyberbullying: every tile has the core the \"don't know\" case lacks, and a wrong tile costs only a «Потом» step", () => {
    expect(NO_UNSURE.has("cyberbullying")).toBe(true);
    const tiles = SITUATIONS.filter((s) => SITUATION_CATEGORY[s] === "cyberbullying");
    const unknown = emptyProfile("unknown");
    expect(questionFor(ITEMS, unknown)).toBeNull();
    expect(platformMatters(ITEMS, unknown)).toBe(false);
    for (const s of tiles) {
      expect(questionFor(ITEMS, emptyProfile(s))?.id, s).toBe("cb.ongoing");
      expect(platformMatters(ITEMS, emptyProfile(s)), s).toBe(true);
    }
    // Whatever the safety answer, platform and «один раз / продолжается», every step a tile puts under «Сейчас» is somewhere
    // in every other tile's plan too.
    for (const safety of [null, ...SAFETY_ANSWERS]) {
      for (const platform of [null, ...PLATFORMS]) {
        for (const ongoing of [false, true]) {
          const variant = (s: SituationId): Profile => ({ ...emptyProfile(s), safety, platform, flags: { ongoing } });
          for (const a of tiles) {
            const now = composePlan(ITEMS, variant(a)).now.map((step) => step.id);
            for (const b of tiles) {
              const all = planIds(variant(b));
              for (const id of now) expect(all, `${a} «Сейчас» ${id} missing on ${b} (${safety}, ${platform}, ${ongoing})`).toContain(id);
            }
          }
        }
      }
    }
  });
});
