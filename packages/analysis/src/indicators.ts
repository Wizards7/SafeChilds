// The closed list of indicator codes the model may return. Anything else is a validation failure, not a new code.

export const INDICATORS = [
  "face_boundary",
  "lighting_mismatch",
  "hands_or_fingers",
  "text_or_logo_artifacts",
  "background_warp",
  "skin_too_smooth",
] as const;
export type Indicator = (typeof INDICATORS)[number];

// A marker on the image: which indicator, where (0..1 of width/height).
export interface Marker {
  code: Indicator;
  x: number;
  y: number;
}
