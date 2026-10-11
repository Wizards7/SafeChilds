// Blocklists for links.check: Google Safe Browsing (Lookup API v4) and URLhaus (abuse.ch). Contracts verified against
// the official docs on 2026-10-11 (plan 0002 item 4). Each list is a capability behind one interface; a list without
// a key is not constructed, so the coverage line says "не проверено" instead of pretending.
// Privacy: the URL leaves to the list's operator. The fragment is dropped; the query stays because phishing lives in it.

import { z } from "zod";

export type BlocklistName = "safe_browsing" | "urlhaus";

export interface Blocklist {
  name: BlocklistName;
  // true = the URL is on the list. Throws when the list did not answer; the caller reports the source as unchecked.
  lookup(url: URL): Promise<boolean>;
}

export interface BlocklistEnv {
  SAFE_BROWSING_API_KEY?: string | undefined;
  URLHAUS_AUTH_KEY?: string | undefined;
}

const TIMEOUT_MS = 5000;

function forLookup(url: URL): string {
  const u = new URL(url.href);
  u.hash = "";
  return u.href;
}

// https://developers.google.com/safe-browsing/v4/lookup-api — POST threatMatches:find?key=…; `{}` when nothing matches.
const SafeBrowsingResponse = z.object({ matches: z.array(z.object({ threatType: z.string() })).optional() });

export function safeBrowsing(fetchFn: typeof fetch, apiKey: string): Blocklist {
  return {
    name: "safe_browsing",
    async lookup(url) {
      const res = await fetchFn(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${encodeURIComponent(apiKey)}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          client: { clientId: "safechilds", clientVersion: "0.1" },
          threatInfo: {
            threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url: forLookup(url) }],
          },
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`safe browsing ${res.status}`);
      const body = SafeBrowsingResponse.parse(await res.json());
      return (body.matches?.length ?? 0) > 0;
    },
  };
}

// https://urlhaus-api.abuse.ch/ — POST form `url=`, header `Auth-Key`; query_status "ok" = listed, "no_results" = not.
const UrlhausResponse = z.object({ query_status: z.string() });

export function urlhaus(fetchFn: typeof fetch, authKey: string): Blocklist {
  return {
    name: "urlhaus",
    async lookup(url) {
      const res = await fetchFn("https://urlhaus-api.abuse.ch/v1/url/", {
        method: "POST",
        headers: { "Auth-Key": authKey, "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ url: forLookup(url) }).toString(),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`urlhaus ${res.status}`);
      const { query_status } = UrlhausResponse.parse(await res.json());
      if (query_status === "ok") return true;
      if (query_status === "no_results") return false;
      throw new Error(`urlhaus ${query_status}`);
    },
  };
}

export function configuredBlocklists(fetchFn: typeof fetch, env: BlocklistEnv): Blocklist[] {
  const lists: Blocklist[] = [];
  if (env.SAFE_BROWSING_API_KEY) lists.push(safeBrowsing(fetchFn, env.SAFE_BROWSING_API_KEY));
  if (env.URLHAUS_AUTH_KEY) lists.push(urlhaus(fetchFn, env.URLHAUS_AUTH_KEY));
  return lists;
}
