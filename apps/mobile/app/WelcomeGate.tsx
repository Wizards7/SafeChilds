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
    if (params.get("from")) {
      void meta.set({ welcomeSeen: true });
      markSplashReady();
      return;
    }
    void meta.get().then((m) => {
      if (cancelled) return;
      if (m.welcomeSeen) markSplashReady();
      else router.replace("/welcome");
    });
    return () => {
      cancelled = true;
    };
  }, [params, router]);
  return null;
}
