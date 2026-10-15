// Where the journey goes after the safety check: the category question if there is one, then the stop card if there is
// one, then the plan. Threat / unsure / urgent answers go to /urgent before any of this (safety page handles that).

import { ITEMS, questionFor, stopCardFor, URGENT_SAFETY, type Profile, type SituationId } from "@safechilds/guidance";
import type { Incident } from "./incident-store";

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

// Where "continue this case" goes (2026-10-15): the safety check if the case never answered it (a tap on a situation
// creates the case before /safety, so a kid can leave there), otherwise the plan. Never straight to the plan past an
// unanswered safety check.
export function resumeHref(profile: Profile): string {
  return profile.safety === null ? "/safety" : "/plan";
}

// What a tap on a situation does while a case exists (Ali, 2026-10-15). The same situation continues that case. Another
// situation replaces a case with nothing to lose at once, and asks first only when something would be deleted: there
// were screenshots, links, checks, finished steps, chat, feelings or breathing. Only the answers go, and the new case
// asks them again.
export type StartChoice = "start" | "resume" | "confirm";

export function startChoice(existing: Incident | null, situation: SituationId): StartChoice {
  if (!existing) return "start";
  if (existing.profile.situation === situation) return "resume";
  return hasWork(existing) ? "confirm" : "start";
}

export function hasWork(incident: Incident): boolean {
  return (
    incident.evidence.length > 0 ||
    incident.analysis !== null ||
    Object.values(incident.steps).some((s) => s.done) ||
    (incident.chat ?? []).length > 0 ||
    (incident.feelings ?? []).length > 0 ||
    (incident.breaths ?? []).length > 0
  );
}
