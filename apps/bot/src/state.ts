// Per-chat state, in memory, lost on restart by design. No chat id ever leaves this process.

import { emptyProfile, type Profile, type SituationId } from "@safechilds/guidance";

export type Locale = "ru" | "tg";
export interface ChatState {
  locale: Locale;
  profile: Profile | null;
}

const chats = new Map<number, ChatState>();

export function getState(chatId: number): ChatState {
  let s = chats.get(chatId);
  if (!s) {
    s = { locale: "ru", profile: null };
    chats.set(chatId, s);
  }
  return s;
}

export function startIncident(chatId: number, situation: SituationId): Profile {
  const s = getState(chatId);
  s.profile = emptyProfile(situation);
  return s.profile;
}

export function reset(chatId: number) {
  chats.delete(chatId);
}
