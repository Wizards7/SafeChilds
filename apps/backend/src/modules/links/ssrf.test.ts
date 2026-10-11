import { describe, expect, it } from "vitest";
import { isBlockedHostname, isInternalHost, isPrivateAddress } from "./ssrf";

describe("isPrivateAddress", () => {
  it.each([
    "127.0.0.1", "127.255.255.254", "10.0.0.1", "10.255.255.255", "172.16.0.1", "172.31.255.255", "192.168.1.1",
    "169.254.169.254", "100.64.0.1", "100.127.255.255", "0.0.0.0", "224.0.0.1", "255.255.255.255", "198.18.0.1", "192.0.0.1",
    "::1", "::", "fc00::1", "fd12:3456::1", "fe80::1", "fe80::1%eth0", "ff02::1", "::ffff:127.0.0.1", "::ffff:10.1.2.3",
    "::ffff:7f00:1", "64:ff9b::192.168.1.1", "not-an-ip",
  ])("%s is private or refused", (ip) => {
    expect(isPrivateAddress(ip)).toBe(true);
  });
  it.each(["93.184.216.34", "8.8.8.8", "172.32.0.1", "172.15.255.255", "100.63.255.255", "100.128.0.1", "2606:2800:220:1:248:1893:25c8:1946", "::ffff:93.184.216.34"])(
    "%s is public",
    (ip) => {
      expect(isPrivateAddress(ip)).toBe(false);
    },
  );
});

describe("isBlockedHostname", () => {
  it.each(["localhost", "LOCALHOST.", "backend", "postgres", "api.railway.internal", "printer.local", "router.lan", "x.home.arpa", "db.internal"])("%s is blocked", (h) => {
    expect(isBlockedHostname(h)).toBe(true);
  });
  it.each(["example.org", "alif.tj", "internal.example.com", "local.example.org"])("%s is allowed to resolve", (h) => {
    expect(isBlockedHostname(h)).toBe(false);
  });
});

describe("isInternalHost", () => {
  const resolve = async (h: string): Promise<string[]> => {
    if (h === "evil.example") return ["10.1.2.3"];
    if (h === "dual.example") return ["93.184.216.34", "fd00::1"];
    if (h === "dead.example") throw new Error("ENOTFOUND");
    return ["93.184.216.34"];
  };
  it("judges literals without resolving and names by every address", async () => {
    expect(await isInternalHost(resolve, "[::1]")).toBe(true);
    expect(await isInternalHost(resolve, "169.254.169.254")).toBe(true);
    expect(await isInternalHost(resolve, "evil.example")).toBe(true);
    expect(await isInternalHost(resolve, "dual.example")).toBe(true);
    expect(await isInternalHost(resolve, "example.org")).toBe(false);
    expect(await isInternalHost(resolve, "dead.example")).toBe(false);
  });
});
