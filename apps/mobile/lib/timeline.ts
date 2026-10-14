// The "Мой случай" timeline (2026-10-14): everything the kid saved and every step they finished, newest first, grouped
// by the day it happened on this phone's clock, plus the week strip above it. Pure: no React, no IndexedDB, so the
// rules are pinned in timeline.test.ts.

import { ITEMS, type StepItem } from "@safechilds/guidance";
import type { Evidence, Incident } from "./incident-store";

export type Entry =
  | { key: string; at: Date; type: "evidence"; e: Evidence }
  | { key: string; at: Date; type: "step"; step: StepItem; stepId: string };

export interface Day {
  key: string;
  date: Date;
  entries: Entry[];
}

export interface StripDay {
  key: string;
  date: Date;
  active: boolean;
  future: boolean;
}

// A file's own date counts as "taken" only when it is clearly older than the moment it was added: some phones hand over
// the pick time instead of the photo's date (VERIFY on iPhone Safari), and that must read as "added", not "taken".
export const TAKEN_MIN_AGE_MS = 2 * 60 * 1000;

export function takenAt(lastModified: number, addedAt: number): string | undefined {
  if (!Number.isFinite(lastModified) || lastModified <= 0 || addedAt - lastModified < TAKEN_MIN_AGE_MS) return undefined;
  return new Date(lastModified).toISOString();
}

const STEPS = new Map(ITEMS.filter((i): i is StepItem => i.kind === "step").map((s) => [s.id, s]));

// When the entry happened: a screenshot's own date when known, otherwise the moment it was saved or the step was ticked.
export function entriesOf(incident: Pick<Incident, "evidence" | "steps">): Entry[] {
  const out: Entry[] = incident.evidence.map((e) => ({
    key: `e-${e.id}`,
    at: new Date(e.kind === "screenshot" && e.takenAt ? e.takenAt : e.createdAt),
    type: "evidence",
    e,
  }));
  for (const [stepId, s] of Object.entries(incident.steps)) {
    const step = STEPS.get(stepId);
    if (s.done && step) out.push({ key: `s-${stepId}`, at: new Date(s.at), type: "step", step, stepId });
  }
  return out.sort((a, b) => b.at.getTime() - a.at.getTime());
}

// The local calendar day, "2026-10-14": the kid's clock decides what "today" is, not UTC.
export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

export function groupByDay(entries: readonly Entry[]): Day[] {
  const days: Day[] = [];
  for (const entry of entries) {
    const key = dayKey(entry.at);
    const last = days[days.length - 1];
    if (last && last.key === key) last.entries.push(entry);
    else days.push({ key, date: startOfDay(entry.at), entries: [entry] });
  }
  return days;
}

export function relativeDay(d: Date, now: Date): "today" | "yesterday" | null {
  const k = dayKey(d);
  if (k === dayKey(now)) return "today";
  if (k === dayKey(addDays(now, -1))) return "yesterday";
  return null;
}

// Monday-first weeks, from the week of the earliest active day (never more than `maxDays` back) to the end of this week.
export function stripDays(active: ReadonlySet<string>, now: Date, maxDays = 35): StripDay[] {
  const today = startOfDay(now);
  const floor = addDays(today, -(maxDays - 1));
  let earliest = today;
  for (const k of active) {
    const [y, m, d] = k.split("-").map(Number);
    const date = new Date(y ?? 0, (m ?? 1) - 1, d ?? 1);
    if (date < earliest) earliest = date;
  }
  if (earliest < floor) earliest = floor;
  const monday = (d: Date) => addDays(d, -((d.getDay() + 6) % 7));
  const start = monday(earliest);
  const end = addDays(monday(today), 6);
  const out: StripDay[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) {
    const key = dayKey(d);
    out.push({ key, date: d, active: active.has(key), future: d > today });
  }
  return out;
}

// The host and path of a saved address, for the card's one line; the address itself is never rendered as a link.
export function shortUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.hostname}${u.pathname === "/" ? "" : u.pathname}`;
  } catch {
    return url; // not an address (a typo, an old note): show it as typed
  }
}
