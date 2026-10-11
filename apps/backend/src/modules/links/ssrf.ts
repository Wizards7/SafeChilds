// Addresses the link check must never contact: loopback, private, link-local, CGNAT, multicast, reserved, cloud
// metadata, and internal names (Docker, Railway). The probe is a bodiless HEAD, but an internal address must still
// never be reached from the backend. Known limit: the name is resolved once and the fetch resolves it again, so a DNS
// answer that changes between the two (rebinding) is not caught; revisit at pilot with a pinned-address agent.

import { isIP } from "node:net";

const BLOCKED_SUFFIXES = [".localhost", ".local", ".internal", ".home.arpa", ".lan"];

export function isPrivateIPv4(ip: string): boolean {
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return true; // malformed: refuse
  const [a, b, c] = p as [number, number, number, number];
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT 100.64/10
  if (a === 169 && b === 254) return true; // link-local, cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 192 && b === 0 && c === 0) return true; // 192.0.0.0/24
  if (a === 198 && (b === 18 || b === 19)) return true; // benchmarking
  if (a >= 224) return true; // multicast, reserved, broadcast
  return false;
}

export function isPrivateIPv6(ip: string): boolean {
  const s = ip.toLowerCase().replace(/^\[|\]$/g, "").split("%")[0]!;
  // IPv4-mapped (::ffff:a.b.c.d) and NAT64 (64:ff9b::a.b.c.d): judge the embedded IPv4.
  const dotted = s.match(/^(?:::ffff:|64:ff9b::)(\d+\.\d+\.\d+\.\d+)$/);
  if (dotted) return isPrivateIPv4(dotted[1]!);
  const hex = s.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (hex) {
    const hi = parseInt(hex[1]!, 16);
    const lo = parseInt(hex[2]!, 16);
    return isPrivateIPv4(`${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`);
  }
  if (s === "::" || s === "::1") return true;
  if (/^f[cd]/.test(s)) return true; // fc00::/7 unique local
  if (/^fe[89ab]/.test(s)) return true; // fe80::/10 link-local
  if (/^ff/.test(s)) return true; // multicast
  return false;
}

export function isPrivateAddress(ip: string): boolean {
  const v = isIP(ip);
  if (v === 4) return isPrivateIPv4(ip);
  if (v === 6) return isPrivateIPv6(ip);
  return true; // not an address: refuse
}

// Names we refuse without resolving. Single-label names are internal by construction (Docker, Railway services).
export function isBlockedHostname(host: string): boolean {
  const h = host.toLowerCase().replace(/\.$/, "");
  if (h === "localhost" || !h.includes(".")) return true;
  return BLOCKED_SUFFIXES.some((s) => h.endsWith(s));
}

// true when the host is definitely internal: a private literal, a blocked name, or a name that resolves to any private
// address. A name that does not resolve at all is not "internal": the fetch fails on its own and counts as a failed source.
export async function isInternalHost(resolve: (host: string) => Promise<string[]>, hostname: string): Promise<boolean> {
  const host = hostname.replace(/^\[|\]$/g, "");
  if (isIP(host)) return isPrivateAddress(host);
  if (isBlockedHostname(host)) return true;
  let addresses: string[];
  try {
    addresses = await resolve(host);
  } catch {
    return false;
  }
  return addresses.some((a) => isPrivateAddress(a));
}
