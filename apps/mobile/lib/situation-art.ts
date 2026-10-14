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
  // STAND-IN until Ali's redraw (one worried kid, one chat): his first picture with its $ painted over the same way. It
  // reads like the impersonation tile at tile size, so the fraud branch does not merge with it.
  profile_asks_money_or_code: [512, 454],
  already_sent: [512, 519],
};

// «Не уверен(а), что из этого» starts a "don't know" case, which costs more than picking either tile here (Ali,
// 2026-10-14): extortion's two tiles give the same plan, so nothing is lost by picking one; on fraud only «Уже
// отправил(а)» gets the bank, card and password steps, and no fraud question adds them to a case later (only the chat
// can, online). An unsure kid taps a tile; one unsure about the category goes back Home. situation-art.test.ts holds
// both reasons.
export const NO_UNSURE: ReadonlySet<Category> = new Set<Category>(["extortion", "fraud"]);
