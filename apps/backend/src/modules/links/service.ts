// The network half of the link check. Pure rules live in @safechilds/analysis; this file follows redirects with
// HEAD (never in anyone's session), asks RDAP for the domain age, and feeds findings to decideLinkTier.
// Blocklists (Safe Browsing, URLhaus) are behind VERIFY in plan 0001 and not wired yet.

import { decideLinkTier, isShortener, lookalike, YOUNG_DOMAIN_DAYS, type LinkFinding, type LinkTier } from "@safechilds/analysis";

export interface LinkDeps {
  fetch: typeof fetch;
  now: () => Date;
}

export interface LinkResult {
  tier: LinkTier;
  findings: LinkFinding[];
  finalUrl: string | null;
}

const TIMEOUT_MS = 5000;
const MAX_HOPS = 5;
const CODE_WORDS = /(otp|sms|code|kod|verify|confirm|login|parol|password|card|karta|bonus|prize|win|podarok)/i;

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let t: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, rej) => {
    t = setTimeout(() => rej(new Error("timeout")), ms);
  });
  try {
    return await Promise.race([p, timeout]);
  } finally {
    if (t) clearTimeout(t);
  }
}

async function followRedirects(deps: LinkDeps, start: URL): Promise<URL | null> {
  let current = start;
  for (let hop = 0; hop < MAX_HOPS; hop++) {
    const res = await withTimeout(deps.fetch(current, { method: "HEAD", redirect: "manual" }), TIMEOUT_MS);
    const loc = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && loc) {
      current = new URL(loc, current);
      continue;
    }
    return current;
  }
  return current;
}

async function domainAgeDays(deps: LinkDeps, host: string): Promise<number | null> {
  // Registrable domain: last two labels is good enough for the demo (VERIFY against a public-suffix list at pilot).
  const parts = host.split(".");
  const domain = parts.slice(-2).join(".");
  const res = await withTimeout(deps.fetch(`https://rdap.org/domain/${domain}`, { headers: { accept: "application/rdap+json" } }), TIMEOUT_MS);
  if (!res.ok) return null;
  const body = (await res.json()) as { events?: { eventAction?: string; eventDate?: string }[] };
  const reg = body.events?.find((e) => e.eventAction === "registration")?.eventDate;
  if (!reg) return null;
  return Math.floor((deps.now().getTime() - new Date(reg).getTime()) / 86_400_000);
}

export async function checkLink(deps: LinkDeps, raw: string): Promise<LinkResult> {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return { tier: "unavailable", findings: [], finalUrl: null };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return { tier: "unavailable", findings: [], finalUrl: null };

  const findings: LinkFinding[] = [];
  let sourcesFailed = 0;
  const sources = 2; // redirects + rdap; blocklists are not wired yet

  let finalUrl: URL | null = null;
  try {
    finalUrl = await followRedirects(deps, url);
  } catch {
    sourcesFailed++;
  }
  const host = (finalUrl ?? url).hostname.toLowerCase();

  if (isShortener(url.hostname)) findings.push({ kind: "shortener", host: url.hostname.toLowerCase(), finalHost: host });
  const look = lookalike(host);
  if (look) findings.push(look);
  // Judge the destination, not the shortener: the words that matter are in the URL the kid would land on.
  if (CODE_WORDS.test((finalUrl ?? url).href)) findings.push({ kind: "asks_for_code_or_payment" });

  try {
    const age = await domainAgeDays(deps, host);
    if (age !== null && age <= YOUNG_DOMAIN_DAYS) findings.push({ kind: "young_domain", host, ageDays: age });
  } catch {
    sourcesFailed++;
  }

  return {
    tier: decideLinkTier({ findings, sourcesFailed: sourcesFailed === sources }),
    findings,
    finalUrl: finalUrl?.href ?? null,
  };
}
