// The honesty contract: tier = f(evidence, indicators, model status). The model adds markers; it never raises a tier.

import { isRaising, type Evidence } from "./evidence";
import type { Marker } from "./indicators";

export const TIERS = ["evidence", "indicators", "inconclusive", "unavailable"] as const;
export type Tier = (typeof TIERS)[number];

export type ModelStatus = "ok" | "failed" | "skipped";

export interface Signals {
  evidence: readonly Evidence[];
  markers: readonly Marker[];
  model: ModelStatus;
}

export interface Decision {
  tier: Tier;
  // Not a tier: the photo is real and misused → the non-consensual-use plan.
  originalMatches: boolean;
  evidence: readonly Evidence[];
  markers: readonly Marker[];
}

export function decideTier(s: Signals): Decision {
  const originalMatches = s.evidence.includes("original_matches");
  const raising = s.evidence.some(isRaising);
  let tier: Tier;
  if (raising) tier = "evidence";
  else if (s.markers.length > 0) tier = "indicators";
  else if (s.model === "failed") tier = "unavailable";
  else tier = "inconclusive";
  return { tier, originalMatches, evidence: s.evidence, markers: s.markers };
}
