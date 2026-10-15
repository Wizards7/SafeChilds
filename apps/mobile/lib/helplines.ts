// Which numbers the urgent screen shows (2026-10-15): every line a team member verified, never filtered by the case's
// category. A threatened bullied kid must still see the police, which is tagged for extortion. The category only orders
// the list: the case's own lines first, then the rest, each group in the order the API returned them.

import type { Category } from "@safechilds/guidance";

type Line = { number: string | null; verifiedAt: string | null; categories: readonly string[] };

export function urgentHelplines<T extends Line>(lines: readonly T[], category: Category): T[] {
  const callable = lines.filter((h) => h.verifiedAt && h.number);
  if (category === "unknown") return callable;
  const own = callable.filter((h) => h.categories.includes(category));
  return [...own, ...callable.filter((h) => !own.includes(h))];
}
