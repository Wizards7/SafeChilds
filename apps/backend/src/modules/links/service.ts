// The network half of the link check. Pure rules live in @safechilds/analysis; this file follows redirects with
// HEAD (never in anyone's session), asks RDAP for the domain age, and feeds findings to decideLinkTier.
// Blocklists (Safe Browsing, URLhaus) run when their keys exist (blocklists.ts); otherwise the coverage line says so.
// Internal addresses are never contacted, neither as the pasted link nor behind a redirect (ssrf.ts, plan 0003).

import { decideLinkTier, isShortener, lookalike, YOUNG_DOMAIN_DAYS, type LinkFinding, type LinkResult, type LinkSource } from "@safechilds/analysis";
import type { Blocklist } from "./blocklists";
import { isInternalHost } from "./ssrf";

export type { LinkResult };

export interface LinkDeps {
  fetch: typeof fetch;
  now: () => Date;
  resolve: (host: string) => Promise<string[]>; // every address a name resolves to
  blocklists: Blocklist[]; // empty when no key is configured
}

const nothing = (): LinkResult => ({ tier: "unavailable", findings: [], finalUrl: null, checked: [], unchecked: ["destination", "lookalike", "age", "blocklists"] });

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
      let next: URL;
      try {
        next = new URL(loc, current);
      } catch {
        return current;
      }
      // Never step into a non-web scheme or an internal address: the last public hop is the answer.
      if ((next.protocol !== "http:" && next.protocol !== "https:") || (await isInternalHost(deps.resolve, next.hostname))) return current;
      current = next;
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
    return nothing();
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return nothing();
  if (await isInternalHost(deps.resolve, url.hostname)) return nothing();

  const findings: LinkFinding[] = [];
  let sourcesFailed = 0;
  const sources = 2 + deps.blocklists.length; // redirects + rdap + each configured blocklist

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

  let ageKnown = false;
  try {
    const age = await domainAgeDays(deps, host);
    ageKnown = age !== null;
    if (age !== null && age <= YOUNG_DOMAIN_DAYS) findings.push({ kind: "young_domain", host, ageDays: age });
  } catch {
    sourcesFailed++;
  }

  // Blocklists: the destination is what matters (a shortener itself is rarely listed). Every list is asked; one
  // answer is enough for "checked", a hit from any list is a finding, a list that did not answer is a failed source.
  let listsAnswered = 0;
  const target = finalUrl ?? url;
  await Promise.all(
    deps.blocklists.map(async (list) => {
      try {
        const listed = await withTimeout(list.lookup(target), TIMEOUT_MS);
        listsAnswered++;
        if (listed) findings.push({ kind: "blocklist", source: list.name });
      } catch {
        sourcesFailed++;
      }
    }),
  );

  // Coverage: the destination counts only when the probe followed the link; the age only when RDAP gave a date;
  // the blocklists only when at least one list answered.
  const checked: LinkSource[] = [];
  const unchecked: LinkSource[] = [];
  (finalUrl ? checked : unchecked).push("destination");
  checked.push("lookalike");
  (ageKnown ? checked : unchecked).push("age");
  (listsAnswered > 0 ? checked : unchecked).push("blocklists");

  return {
    tier: decideLinkTier({ findings, sourcesFailed: sourcesFailed === sources }),
    findings,
    finalUrl: finalUrl?.href ?? null,
    checked,
    unchecked,
  };
}
