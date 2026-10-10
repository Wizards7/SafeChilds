// A small predicate language over the profile. Content declares where it belongs; no code in content.

import type { Category, Flag, Platform, Profile, SafetyAnswer, SituationId } from "./profile";

export type ShowWhen =
  | true
  | { category: Category | Category[] }
  | { situation: SituationId | SituationId[] }
  | { platform: Platform | Platform[] }
  | { safety: SafetyAnswer | SafetyAnswer[] }
  | { flag: Flag }
  | { not: ShowWhen }
  | { all: ShowWhen[] }
  | { any: ShowWhen[] };

function oneOf<T>(value: T | null, wanted: T | T[]): boolean {
  if (value === null) return false;
  return Array.isArray(wanted) ? wanted.includes(value) : wanted === value;
}

export function matches(rule: ShowWhen, profile: Profile): boolean {
  if (rule === true) return true;
  if ("category" in rule) return oneOf(profile.category, rule.category);
  if ("situation" in rule) return oneOf(profile.situation, rule.situation);
  if ("platform" in rule) return oneOf(profile.platform, rule.platform);
  if ("safety" in rule) return oneOf(profile.safety, rule.safety);
  if ("flag" in rule) return profile.flags[rule.flag] === true;
  if ("not" in rule) return !matches(rule.not, profile);
  if ("all" in rule) return rule.all.every((r) => matches(r, profile));
  if ("any" in rule) return rule.any.some((r) => matches(r, profile));
  return false;
}
