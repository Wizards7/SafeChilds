// Verifiable facts the client or server can establish without a model.
// RAISING evidence moves the tier to "evidence". The rest are facts shown as facts; they never raise a tier.

export const RAISING_EVIDENCE = [
  "c2pa_declares_generated",
  "c2pa_declares_edited",
  "exif_contradiction",
  "original_differs",
] as const;
export type RaisingEvidence = (typeof RAISING_EVIDENCE)[number];

export const NEUTRAL_EVIDENCE = ["exif_stripped", "exif_present", "c2pa_absent", "original_matches"] as const;
export type NeutralEvidence = (typeof NEUTRAL_EVIDENCE)[number];

export type Evidence = RaisingEvidence | NeutralEvidence;

export function isRaising(e: Evidence): e is RaisingEvidence {
  return (RAISING_EVIDENCE as readonly string[]).includes(e);
}
