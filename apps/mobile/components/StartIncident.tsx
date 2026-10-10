"use client";

// Tapping a situation starts the one incident on the device (replacing any previous one) and goes to the safety check.

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { emptyProfile, type SituationId } from "@safechilds/guidance";
import { incidentStore } from "../lib/incident-store";

export function StartIncident({ situation, className, children }: { situation: SituationId; className: string; children: ReactNode }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      className={className}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await incidentStore.start(emptyProfile(situation));
        router.push("/safety");
      }}
    >
      {children}
    </button>
  );
}
