// Where the journey goes after the safety check: the category question if there is one, then the stop card if there is
// one, then the plan. Threat / unsure / urgent answers go to /urgent before any of this (safety page handles that).

import { ITEMS, questionFor, stopCardFor, URGENT_SAFETY, type Profile } from "@safechilds/guidance";

export function isUrgent(profile: Profile): boolean {
  return profile.safety !== null && URGENT_SAFETY.has(profile.safety);
}

export function afterSafety(profile: Profile): string {
  if (questionFor(ITEMS, profile)) return "/question";
  if (stopCardFor(ITEMS, profile)) return "/stop";
  return "/plan";
}

export function afterQuestion(profile: Profile, next: "analyze" | "link" | "stop" | "plan" | undefined): string {
  if (next === "analyze") return "/analyze";
  if (next === "link") return "/link";
  if (next === "stop" || stopCardFor(ITEMS, profile)) return "/stop";
  return "/plan";
}
