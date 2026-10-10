// Local checks that run on the phone before anything is uploaded. Facts only; the tier is decided by packages/analysis.
// - EXIF: present / stripped / contradiction (the Software tag names an editing or generation tool)
// - Content Credentials: presence of a C2PA (JUMBF) manifest in the file. Presence only; signature validation is a pilot item.
// - Compare with the original: both images downscaled to 48×48 grayscale, mean absolute difference.

import exifr from "exifr";
import type { Evidence } from "@safechilds/analysis";

// Software tags that mean the file was edited or generated. The tag is a fact in the file, not a guess.
const EDITOR_SOFTWARE = /(photoshop|lightroom|gimp|faceapp|facetune|picsart|snapseed|canva|stable diffusion|midjourney|dall|firefly|comfyui|automatic1111|invokeai|leonardo|remini|lensa)/i;

export async function exifEvidence(file: File): Promise<Evidence[]> {
  try {
    const data = (await exifr.parse(file, { pick: ["Make", "Model", "Software", "DateTimeOriginal", "ExifImageWidth", "ExifImageHeight"] })) as Record<string, unknown> | undefined;
    if (!data || Object.keys(data).length === 0) return ["exif_stripped"];
    const software = typeof data["Software"] === "string" ? data["Software"] : "";
    return EDITOR_SOFTWARE.test(software) ? ["exif_present", "exif_contradiction"] : ["exif_present"];
  } catch {
    return ["exif_stripped"];
  }
}

// JPEG APP11 segments carry JUMBF boxes; a C2PA manifest box has the type "jumb" with a "c2pa" label.
// PNG and WebP embed the same manifest in a chunk/chunk-like box. Scanning for the ASCII markers is enough for presence.
export async function c2paEvidence(file: File): Promise<Evidence> {
  const head = new Uint8Array(await file.slice(0, 4 * 1024 * 1024).arrayBuffer());
  const text = new TextDecoder("latin1").decode(head);
  return text.includes("c2pa") && (text.includes("jumb") || text.includes("c2ma") || text.includes("caBX")) ? "c2pa_present_unverified" : "c2pa_absent";
}

async function thumbnail(file: File, size = 48): Promise<Float32Array | null> {
  if (typeof createImageBitmap !== "function") return null;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return null;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(bitmap, 0, 0, size, size);
  bitmap.close();
  const { data } = ctx.getImageData(0, 0, size, size);
  const gray = new Float32Array(size * size);
  for (let i = 0; i < gray.length; i++) {
    const o = i * 4;
    gray[i] = (0.299 * (data[o] ?? 0) + 0.587 * (data[o + 1] ?? 0) + 0.114 * (data[o + 2] ?? 0)) / 255;
  }
  return gray;
}

// Mean absolute difference of the two thumbnails, 0..1. Re-encoding the same photo stays well under the threshold;
// a replaced face or background goes over it. VERIFY the threshold on the demo pair before the day.
export const DIFFERS_THRESHOLD = 0.08;

export async function compareWithOriginal(candidate: File, original: File): Promise<{ evidence: Evidence; score: number } | null> {
  const [a, b] = await Promise.all([thumbnail(candidate), thumbnail(original)]);
  if (!a || !b) return null;
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += Math.abs((a[i] ?? 0) - (b[i] ?? 0));
  const score = sum / a.length;
  return { evidence: score > DIFFERS_THRESHOLD ? "original_differs" : "original_matches", score };
}
