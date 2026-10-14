// The situation tiles' pictures (Ali's set, 2026-10-14): public/situation/<id>.webp at these pixel sizes, so each <img>
// reserves its box before it loads. A category shows tiles only when every one of its situations is here; the others keep
// the plain rows until their art and copy are approved. Adding one: the file, its size here, its title and description
// in messages (situation.tile.<id>), and its path in public/sw.js — situation-art.test.ts checks all four.

import type { SituationId } from "@safechilds/guidance";

export const SITUATION_ART: Partial<Record<SituationId, readonly [width: number, height: number]>> = {
  fake_photo: [512, 498],
  fake_video: [512, 464],
  impersonation: [512, 471],
  threat_to_publish: [512, 592],
  // The £ on the banknote was painted over with the coin's own navy (not the somoni; a plain mark instead).
  demand_money_or_photos: [512, 477],
};
