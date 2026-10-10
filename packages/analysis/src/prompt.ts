// The model returns indicator codes with positions and nothing else. Validated with Zod; anything else is a failure.

import { z } from "zod";
import { INDICATORS } from "./indicators";

export const ModelResponse = z.object({
  indicators: z
    .array(
      z.object({
        code: z.enum(INDICATORS),
        x: z.number().min(0).max(1),
        y: z.number().min(0).max(1),
      }),
    )
    .max(6),
});
export type ModelResponse = z.infer<typeof ModelResponse>;

export const SYSTEM_PROMPT = `You assist a teenager's safety app. You are shown one image. Your only job is to list visual indicators that MAY suggest the image was generated or manipulated, from this closed list, each with the approximate position (x, y as fractions of width and height, 0..1) of the area to look at:
${INDICATORS.map((i) => `- ${i}`).join("\n")}
Rules:
- Return ONLY JSON matching {"indicators":[{"code":"<one of the list>","x":0..1,"y":0..1}]}. No prose, no other keys.
- Return an empty list when you see nothing from the list. Do not guess.
- Never state whether the image is real or fake. Never output a probability or a percentage.
- At most 6 indicators. Do not repeat a code.`;
