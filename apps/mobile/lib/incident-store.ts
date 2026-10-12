// The one incident, on the device. IndexedDB via idb. Nothing here is ever sent to a server.
// Shape: apps/mobile/SCHEMA.md. Deleting the incident is a real delete.

import { openDB, type IDBPDatabase } from "idb";
import type { Feeling, Platform, Profile, SafetyAnswer } from "@safechilds/guidance";
import type { Decision, TriageRoute } from "@safechilds/analysis";

export interface Evidence {
  id: string;
  kind: "url" | "screenshot" | "note";
  value: string | Blob;
  createdAt: string;
}

// One turn of the guided chat. "me" carries the kid's words; "app" carries step ids and a route, never generated text.
export interface ChatTurn {
  id: string;
  role: "me" | "app";
  text?: string;
  items?: string[];
  route?: TriageRoute;
  failed?: boolean;
  at: string;
}

export interface Incident {
  incidentKey: string;
  profile: Profile;
  analysis: (Decision & { at: string }) | null;
  evidence: Evidence[];
  steps: Record<string, { done: boolean; at: string }>;
  chat: ChatTurn[]; // older incidents on a phone may lack it: read with `?? []`
  createdAt: string;
  updatedAt: string;
}

interface Meta {
  welcomeSeen?: boolean;
  installPromptShown?: boolean;
}

const DB = "safechilds";
const STORE = "kv";
const INCIDENT = "incident";
const META = "meta";

let dbPromise: Promise<IDBPDatabase> | null = null;
function db() {
  if (typeof indexedDB === "undefined") return null;
  dbPromise ??= openDB(DB, 1, {
    upgrade(d) {
      d.createObjectStore(STORE);
    },
  });
  return dbPromise;
}

async function get<T>(key: string): Promise<T | null> {
  const d = await db();
  if (!d) return null;
  return ((await d.get(STORE, key)) as T | undefined) ?? null;
}
async function put(key: string, value: unknown) {
  const d = await db();
  if (!d) return;
  await d.put(STORE, value, key);
}

export const meta = {
  get: () => get<Meta>(META).then((m) => m ?? {}),
  async set(patch: Meta) {
    const current = (await get<Meta>(META)) ?? {};
    await put(META, { ...current, ...patch });
  },
};

function randomKey() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export const incidentStore = {
  get: () => get<Incident>(INCIDENT),

  async start(profile: Profile): Promise<Incident> {
    const now = new Date().toISOString();
    const incident: Incident = { incidentKey: randomKey(), profile, analysis: null, evidence: [], steps: {}, chat: [], createdAt: now, updatedAt: now };
    await put(INCIDENT, incident);
    return incident;
  },

  async update(patch: (i: Incident) => Incident): Promise<Incident | null> {
    const current = await get<Incident>(INCIDENT);
    if (!current) return null;
    const next = { ...patch(current), updatedAt: new Date().toISOString() };
    await put(INCIDENT, next);
    return next;
  },

  setSafety: (safety: SafetyAnswer) => incidentStore.update((i) => ({ ...i, profile: { ...i.profile, safety, flags: { ...i.profile.flags, threatened: safety === "threatened" || i.profile.flags.threatened === true } } })),
  setPlatform: (platform: Platform) => incidentStore.update((i) => ({ ...i, profile: { ...i.profile, platform } })),
  setFeeling: (feeling: Feeling) => incidentStore.update((i) => ({ ...i, profile: { ...i.profile, feeling } })),
  setFlags: (flags: Profile["flags"]) => incidentStore.update((i) => ({ ...i, profile: { ...i.profile, flags: { ...i.profile.flags, ...flags } } })),
  setAnalysis: (decision: Decision) => incidentStore.update((i) => ({ ...i, analysis: { ...decision, at: new Date().toISOString() } })),
  toggleStep: (stepId: string) =>
    incidentStore.update((i) => ({ ...i, steps: { ...i.steps, [stepId]: { done: !(i.steps[stepId]?.done ?? false), at: new Date().toISOString() } } })),
  addEvidence: (e: Omit<Evidence, "id" | "createdAt">) =>
    incidentStore.update((i) => ({ ...i, evidence: [...i.evidence, { ...e, id: randomKey(), createdAt: new Date().toISOString() }] })),
  removeEvidence: (id: string) => incidentStore.update((i) => ({ ...i, evidence: i.evidence.filter((e) => e.id !== id) })),
  addChat: (turn: Omit<ChatTurn, "id" | "at">) =>
    incidentStore.update((i) => ({ ...i, chat: [...(i.chat ?? []), { ...turn, id: randomKey(), at: new Date().toISOString() }] })),
  // The chat's codes become the profile only when they are more specific than what the kid already picked.
  setProfileFromCodes: (codes: { category: Profile["category"] | null; situation: Profile["situation"] | null; flags: Profile["flags"]; platform: Platform | null }) =>
    incidentStore.update((i) => {
      const situation = codes.situation ?? i.profile.situation;
      const category = codes.situation ? (codes.category ?? i.profile.category) : i.profile.category === "unknown" ? (codes.category ?? i.profile.category) : i.profile.category;
      return { ...i, profile: { ...i.profile, category, situation, flags: { ...i.profile.flags, ...codes.flags }, platform: codes.platform ?? i.profile.platform } };
    }),

  async clear() {
    const d = await db();
    if (!d) return;
    await d.delete(STORE, INCIDENT); // the welcome flag in META stays
  },
};
