// The situation profile: four or five taps, and every screen renders from this one object.
// Defined once here; apps/mobile stores it in IndexedDB, apps/bot keeps it in memory.

export const CATEGORIES = ["fake_content", "extortion", "fraud", "cyberbullying", "unknown"] as const;
export type Category = (typeof CATEGORIES)[number];

export const SITUATIONS = [
  "fake_photo",
  "fake_video",
  "impersonation",
  "threat_to_publish",
  "demand_money_or_photos",
  "profile_asks_money_or_code",
  "already_sent",
  "public_humiliation",
  "persistent_messages",
  "group_against_me",
  "unknown",
] as const;
export type SituationId = (typeof SITUATIONS)[number];

export const SITUATION_CATEGORY: Record<SituationId, Category> = {
  fake_photo: "fake_content",
  fake_video: "fake_content",
  impersonation: "fake_content",
  threat_to_publish: "extortion",
  demand_money_or_photos: "extortion",
  profile_asks_money_or_code: "fraud",
  already_sent: "fraud",
  public_humiliation: "cyberbullying",
  persistent_messages: "cyberbullying",
  group_against_me: "cyberbullying",
  unknown: "unknown",
};

export const SAFETY_ANSWERS = ["safe", "threatened", "unsure", "urgent"] as const;
export type SafetyAnswer = (typeof SAFETY_ANSWERS)[number];

// Answers that bypass everything and open /urgent.
export const URGENT_SAFETY: ReadonlySet<SafetyAnswer> = new Set(["threatened", "unsure", "urgent"]);

// VERIFY with the floater which platforms teens in Tajikistan actually use (VK? Likee?).
export const PLATFORMS = ["instagram", "tiktok", "telegram", "vk"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const FEELINGS = [
  "scared",
  "anxious",
  "angry",
  "sad",
  "ashamed",
  "overwhelmed",
  "dont_know",
  "prefer_not",
] as const;
export type Feeling = (typeof FEELINGS)[number];

export const FLAGS = [
  "ongoing",
  "alreadyPaid",
  "alreadySent",
  "hasOriginal",
  "photoShared",
  "intimate",
  "threatened",
] as const;
export type Flag = (typeof FLAGS)[number];

export interface Profile {
  category: Category;
  situation: SituationId;
  safety: SafetyAnswer | null;
  platform: Platform | null;
  feeling: Feeling | null;
  flags: Partial<Record<Flag, boolean>>;
}

export function emptyProfile(situation: SituationId): Profile {
  return {
    category: SITUATION_CATEGORY[situation],
    situation,
    safety: null,
    platform: null,
    feeling: null,
    flags: {},
  };
}
