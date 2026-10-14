import { describe, expect, it } from "vitest";
import { minutesThisWeek, picksByDay } from "./wellbeing";

// Local wall-clock dates, so the tests hold in any time zone the suite runs in. 2026-10-14 is a Wednesday.
const iso = (d: number, h = 12) => new Date(2026, 9, d, h).toISOString();

describe("picksByDay", () => {
  it("groups the picks by local day in the order they were made", () => {
    const days = picksByDay([
      { feeling: "sad", at: iso(14, 18) },
      { feeling: "scared", at: iso(12, 9) },
      { feeling: "anxious", at: iso(14, 8) },
    ]);
    expect([...days.entries()]).toEqual([
      ["2026-10-12", ["scared"]],
      ["2026-10-14", ["anxious", "sad"]],
    ]);
  });
  it("is empty without picks", () => {
    expect(picksByDay([]).size).toBe(0);
  });
});

describe("minutesThisWeek", () => {
  it("counts finished minutes from Monday of this week, not before", () => {
    const now = new Date(2026, 9, 14, 20);
    const breaths = [{ at: iso(11, 23) }, { at: iso(12, 0) }, { at: iso(13) }, { at: iso(14) }];
    expect(minutesThisWeek(breaths, now)).toBe(3);
  });
  it("starts again on Monday", () => {
    expect(minutesThisWeek([{ at: iso(18) }], new Date(2026, 9, 19, 9))).toBe(0);
  });
});
