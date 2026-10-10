// POST /analysis — multipart: `image` (jpeg/png/webp ≤ 8 MB) + optional `evidence` (JSON array of local facts the phone
// established: exif_stripped, c2pa_absent, original_differs, …). Plain Fastify route because tRPC's JSON transport is the
// wrong fit for a file; the response shape matches what the app renders: tier + markers + evidence + originalMatches.

import type { FastifyInstance } from "fastify";
import { ALLOWED_TYPES, analyzeImage, EvidenceList, MAX_BYTES, type AnalysisDeps } from "./service";

export function registerAnalysisRoute(app: FastifyInstance, deps: AnalysisDeps) {
  app.post("/analysis", { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } }, async (req, reply) => {
    const part = await req.file({ limits: { fileSize: MAX_BYTES, files: 1 } });
    if (!part) return reply.code(400).send({ code: "NO_IMAGE", message: "image is required" });
    if (!ALLOWED_TYPES.has(part.mimetype)) return reply.code(415).send({ code: "UNSUPPORTED_TYPE", message: "jpeg, png or webp only" });

    const bytes = await part.toBuffer().catch(() => null);
    if (!bytes) return reply.code(413).send({ code: "TOO_LARGE", message: "image must be 8 MB or smaller" });

    const rawEvidence = part.fields["evidence"];
    const evidenceText = rawEvidence && !Array.isArray(rawEvidence) && rawEvidence.type === "field" ? String(rawEvidence.value) : "[]";
    let evidence: ReturnType<typeof EvidenceList.parse>;
    try {
      evidence = EvidenceList.parse(JSON.parse(evidenceText));
    } catch {
      return reply.code(400).send({ code: "BAD_EVIDENCE", message: "evidence must be a JSON array of known codes" });
    }

    const decision = await analyzeImage(deps, { bytes, mime: part.mimetype }, evidence);
    return reply.send(decision);
  });
}
