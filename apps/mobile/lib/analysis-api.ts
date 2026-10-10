// POST /analysis — the only call that sends an image off the phone. If the backend is unreachable, the tier is
// decided locally from the facts the phone established (model: failed), so the result screen never dead-ends.

import { decideTier, type Decision, type Evidence } from "@safechilds/analysis";
import { API_URL } from "./trpc";

export async function analyzeImage(file: File, evidence: Evidence[], timeoutMs = 25_000): Promise<Decision & { offline: boolean }> {
  const form = new FormData();
  form.append("image", file, file.name || "image");
  form.append("evidence", JSON.stringify(evidence));
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_URL}/analysis`, { method: "POST", body: form, signal: ctrl.signal });
    if (!res.ok) throw new Error(`analysis ${res.status}`);
    const d = (await res.json()) as Decision;
    return { ...d, offline: false };
  } catch {
    return { ...decideTier({ evidence, markers: [], model: "failed" }), offline: true };
  } finally {
    clearTimeout(timer);
  }
}
