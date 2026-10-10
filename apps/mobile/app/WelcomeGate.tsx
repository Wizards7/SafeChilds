"use client";

// First open → /welcome. Deep links (?from=bot, the QR with ?from=qr) bypass it. Renders nothing.

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { meta } from "../lib/incident-store";

export function WelcomeGate() {
  const router = useRouter();
  const params = useSearchParams();
  useEffect(() => {
    let cancelled = false;
    if (params.get("from")) {
      void meta.set({ welcomeSeen: true });
      return;
    }
    void meta.get().then((m) => {
      if (!cancelled && !m.welcomeSeen) router.replace("/welcome");
    });
    return () => {
      cancelled = true;
    };
  }, [params, router]);
  return null;
}
