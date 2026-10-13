"use client";

// First open → /welcome. Deep links (?from=bot, the QR with ?from=qr) bypass it. Renders nothing.
// It also tells the opening splash when Home is the screen to show (lib/splash.ts); after the redirect, Welcome does.

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { meta } from "../lib/incident-store";
import { markSplashReady } from "../lib/splash";

export function WelcomeGate() {
  const router = useRouter();
  const params = useSearchParams();
  useEffect(() => {
    let cancelled = false;
    // The store can fail (StorageUnavailable in lib/incident-store.ts): with no flag to read or write, Home stays and the
    // splash lets go; the welcome is not forced on a phone that cannot remember it was seen.
    if (params.get("from")) {
      void meta.set({ welcomeSeen: true }).catch(() => undefined);
      markSplashReady();
      return;
    }
    void meta.get().then(
      (m) => {
        if (cancelled) return;
        if (m.welcomeSeen) markSplashReady();
        else router.replace("/welcome");
      },
      () => {
        if (!cancelled) markSplashReady();
      },
    );
    return () => {
      cancelled = true;
    };
  }, [params, router]);
  return null;
}
