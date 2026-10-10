// Image analysis: validate → model (if a key exists) → decideTier → one analysis_events row → image discarded.
// The image is a Buffer in memory for this request only. Never written, never logged, never stored.

import { decideTier, INDICATORS, ModelResponse, SYSTEM_PROMPT, type Decision, type Evidence, type Marker, type ModelStatus, RAISING_EVIDENCE, NEUTRAL_EVIDENCE } from "@safechilds/analysis";
import { schema, type Db } from "@safechilds/db";
import { z } from "zod";

export const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
export const MAX_BYTES = 8 * 1024 * 1024;

export const EvidenceList = z.array(z.enum([...RAISING_EVIDENCE, ...NEUTRAL_EVIDENCE])).max(8).default([]);

export interface ModelClient {
  // Returns the model's raw text for the image, or throws. The service validates the JSON.
  describe(image: { bytes: Buffer; mime: string }): Promise<string>;
}

export interface AnalysisDeps {
  db: Db;
  model: ModelClient | null; // null until ANTHROPIC_API_KEY exists
  log: { warn: (msg: string) => void };
}

async function runModel(deps: AnalysisDeps, image: { bytes: Buffer; mime: string }): Promise<{ status: ModelStatus; markers: Marker[] }> {
  if (!deps.model) return { status: "failed", markers: [] };
  try {
    const text = await deps.model.describe(image);
    const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    const parsed = ModelResponse.safeParse(JSON.parse(json));
    if (!parsed.success) {
      deps.log.warn("model response failed validation");
      return { status: "failed", markers: [] };
    }
    // Dedupe codes; the prompt asks for it, the rules do not rely on it.
    const seen = new Set<string>();
    const markers = parsed.data.indicators.filter((m) => (seen.has(m.code) ? false : (seen.add(m.code), true)));
    return { status: "ok", markers };
  } catch {
    deps.log.warn("model call failed");
    return { status: "failed", markers: [] };
  }
}

export async function analyzeImage(deps: AnalysisDeps, image: { bytes: Buffer; mime: string }, clientEvidence: Evidence[]): Promise<Decision> {
  const model = await runModel(deps, image);
  const decision = decideTier({ evidence: clientEvidence, markers: model.markers, model: model.status });
  await deps.db.insert(schema.analysisEvents).values({
    status: decision.tier,
    indicatorCodes: decision.markers.map((m) => m.code).filter((c): c is (typeof INDICATORS)[number] => (INDICATORS as readonly string[]).includes(c)),
  });
  return decision;
}

export { SYSTEM_PROMPT };
