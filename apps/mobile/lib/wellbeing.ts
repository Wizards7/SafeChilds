// The Поддержка tab's own small history (2026-10-14): «Твои отметки» (the feelings picked per day) and the minutes of
// breathing this week. Pure, so the rules are pinned in wellbeing.test.ts. No score, no average, no trend: a feeling is
// shown as the picture the kid picked, never turned into a number.

import type { Feeling } from "@safechilds/guidance";
import { dayKey } from "./timeline";

export interface Pick {
  feeling: Feeling;
  at: string;
}

// Each local day's picks, in the order they were made (the card shows the last one).
export function picksByDay(picks: readonly Pick[]): Map<string, Feeling[]> {
  const days = new Map<string, Feeling[]>();
  for (const p of [...picks].sort((a, b) => a.at.localeCompare(b.at))) {
    const key = dayKey(new Date(p.at));
    days.set(key, [...(days.get(key) ?? []), p.feeling]);
  }
  return days;
}

// Finished breathing minutes since Monday of this week, on this phone's clock.
export function minutesThisWeek(breaths: readonly { at: string }[], now: Date): number {
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
  return breaths.filter((b) => new Date(b.at) >= monday).length;
}
