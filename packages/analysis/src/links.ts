// Link check: the same contract on a different input. Pure functions only; the backend does the network part
// (redirects with HEAD, RDAP, blocklists) and feeds results here.

import type { LinkSource } from "./coverage";

export const LINK_TIERS = ["known_dangerous", "signs", "nothing_known", "unavailable"] as const;
export type LinkTier = (typeof LINK_TIERS)[number];

export type LinkFinding =
  | { kind: "blocklist"; source: "safe_browsing" | "urlhaus" }
  | { kind: "lookalike"; host: string; brand: string; real: string }
  | { kind: "young_domain"; host: string; ageDays: number }
  | { kind: "shortener"; host: string; finalHost: string }
  | { kind: "asks_for_code_or_payment" };

// Brands teens in Tajikistan actually use. VERIFY the list with the floater; keep it short on purpose.
export const KNOWN_BRANDS: readonly { brand: string; real: string }[] = [
  { brand: "alif", real: "alif.tj" },
  { brand: "eskhata", real: "eskhata.tj" },
  { brand: "amonatbonk", real: "amonatbonk.tj" },
  { brand: "instagram", real: "instagram.com" },
  { brand: "telegram", real: "telegram.org" },
  { brand: "tiktok", real: "tiktok.com" },
  { brand: "whatsapp", real: "whatsapp.com" },
  { brand: "google", real: "google.com" },
];

export const SHORTENERS: ReadonlySet<string> = new Set(["bit.ly", "t.co", "tinyurl.com", "goo.gl", "cutt.ly", "is.gd", "clck.ru", "vk.cc", "t.ly", "rb.gy"]);

export function isShortener(host: string): boolean {
  return SHORTENERS.has(host.toLowerCase());
}

// Host contains a brand name but is not that brand's domain (or a subdomain of it).
export function lookalike(host: string): LinkFinding | null {
  const h = host.toLowerCase();
  for (const { brand, real } of KNOWN_BRANDS) {
    if (h === real || h.endsWith("." + real)) return null;
    if (h.replace(/[-_.]/g, "").includes(brand)) return { kind: "lookalike", host: h, brand, real };
  }
  return null;
}

export const YOUNG_DOMAIN_DAYS = 30;

// What the backend returns: the tier, the findings, the destination, and which sources actually answered.
export interface LinkResult {
  tier: LinkTier;
  findings: LinkFinding[];
  finalUrl: string | null;
  checked: LinkSource[];
  unchecked: LinkSource[];
}

export interface LinkSignals {
  findings: readonly LinkFinding[];
  // true when every external source failed (blocklists and RDAP); deterministic checks still ran
  sourcesFailed: boolean;
}

export function decideLinkTier(s: LinkSignals): LinkTier {
  if (s.findings.some((f) => f.kind === "blocklist")) return "known_dangerous";
  if (s.findings.length > 0) return "signs";
  if (s.sourcesFailed) return "unavailable";
  return "nothing_known";
}
