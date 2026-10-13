"use client";

// Reads the one incident from IndexedDB. `refresh` after every write so the screen reflects the store, never a hand-patched copy.
// `failed` = the store did not open (StorageUnavailable in incident-store.ts); screens that need the case show StoreFailed.

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { incidentStore, type Incident } from "./incident-store";

export function useIncident(opts: { requireIncident?: boolean } = {}) {
  const router = useRouter();
  const [incident, setIncident] = useState<Incident | null | undefined>(undefined); // undefined = loading
  const [failed, setFailed] = useState(false);
  const refresh = useCallback(async () => {
    const i = await incidentStore.get();
    setIncident(i);
    return i;
  }, []);
  useEffect(() => {
    let cancelled = false;
    void incidentStore.get().then(
      (i) => {
        if (cancelled) return;
        setIncident(i);
        if (!i && opts.requireIncident) router.replace("/");
      },
      () => {
        if (!cancelled) setFailed(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [router, opts.requireIncident]);
  return { incident, loading: incident === undefined && !failed, failed, refresh };
}
