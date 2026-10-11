// The one place the Anthropic SDK is imported. Returns the model's raw text; the service validates it.
// Low effort, short max_tokens, 20 s timeout: the output is a tiny JSON list, never prose.

import Anthropic from "@anthropic-ai/sdk";
import type { ModelClient } from "./service";
import { SYSTEM_PROMPT } from "./service";
import type { TextModelClient } from "../triage/service";

const MEDIA = new Set(["image/jpeg", "image/png", "image/webp"] as const);
type Media = "image/jpeg" | "image/png" | "image/webp";

export function createAnthropicClient(apiKey: string, model: string): ModelClient {
  const client = new Anthropic({ apiKey, maxRetries: 1 });
  return {
    async describe(image) {
      if (!MEDIA.has(image.mime as Media)) throw new Error("unsupported media type");
      const response = await client.messages.create(
        {
          model,
          max_tokens: 512,
          system: SYSTEM_PROMPT,
          output_config: { effort: "low" },
          messages: [
            {
              role: "user",
              content: [
                { type: "image", source: { type: "base64", media_type: image.mime as Media, data: image.bytes.toString("base64") } },
                { type: "text", text: "List the indicators as JSON." },
              ],
            },
          ],
        },
        { timeout: 20_000 },
      );
      if (response.stop_reason === "refusal") throw new Error("model refused");
      if (response.stop_reason === "max_tokens") throw new Error("model hit max_tokens before finishing the JSON");
      return response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("");
    },
  };
}

// The guided chat: a system prompt and the kid's text, codes back. Short output, low effort, 15 s.
export function createTextModel(apiKey: string, model: string): TextModelClient {
  const client = new Anthropic({ apiKey, maxRetries: 1 });
  return {
    async reply(system, user) {
      const response = await client.messages.create(
        { model, max_tokens: 400, system, output_config: { effort: "low" }, messages: [{ role: "user", content: user }] },
        { timeout: 15_000 },
      );
      if (response.stop_reason === "refusal") throw new Error("model refused");
      if (response.stop_reason === "max_tokens") throw new Error("model hit max_tokens before finishing the JSON");
      return response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("");
    },
  };
}
