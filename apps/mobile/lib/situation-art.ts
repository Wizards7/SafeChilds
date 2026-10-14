// The situation tiles' pictures (Ali's set, 2026-10-14): public/situation/<id>.webp at these pixel sizes, so each <img>
// reserves its box before it loads. A category shows tiles only when every one of its situations is here; the others keep
// the plain rows until their art and copy are approved. Adding one: the file, its size here, its title and description
// in messages (situation.tile.<id>), and its path in public/sw.js — situation-art.test.ts checks all four.
// Also here: the categories whose tile page has no «Не уверен(а)» row (NO_UNSURE), because the page reads both.

import type { Category, SituationId } from "@safechilds/guidance";

export const SITUATION_ART: Partial<Record<SituationId, readonly [width: number, height: number]>> = {
  fake_photo: [512, 498],
  fake_video: [512, 464],
  impersonation: [512, 471],
  threat_to_publish: [512, 592],
  // The £ on the banknote was painted over with the coin's own navy (not the somoni; a plain mark instead).
  demand_money_or_photos: [512, 477],
  public_humiliation: [512, 434],
  // STAND-IN until Ali's redraw: the boy smiles, the only happy face on the page (keep a worried face).
  persistent_messages: [512, 502],
  // STAND-IN until Ali's redraw: no group is drawn, so it repeats public_humiliation (add 3–4 faceless teens, <= 1.2:1).
  group_against_me: [512, 467],
};

// «Не уверен(а), что из этого» starts a "don't know" case, which costs more than picking any tile here (Ali, 2026-10-14):
// extortion's two tiles give the same plan, so nothing is lost by picking one; cyberbullying's three tiles share the
// whole bullying core (the «один раз или продолжается?» question, the platform report taps, the ready message) and
// differ only in a «Потом» step, while the "don't know" case loses that core. An unsure kid taps a tile; the tile lines
// cover the other forms (rumours, being left out of a group). situation-art.test.ts holds the reasons.
export const NO_UNSURE: ReadonlySet<Category> = new Set<Category>(["extortion", "cyberbullying"]);
