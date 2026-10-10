// Validated at boot. A missing or malformed variable is a crash with a clear message, not a runtime surprise.

import { z } from "zod";

const Env = z.object({
  DATABASE_URL: z.string().url(),
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:3000")
    .transform((s) => s.split(",").map((o) => o.trim()).filter(Boolean)),
  PORT: z.coerce.number().int().positive().default(4100),
  ANTHROPIC_API_KEY: z.string().optional().transform((v) => (v && v.length > 0 ? v : undefined)),
  ANTHROPIC_MODEL: z.string().default("claude-opus-5"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export type Env = z.infer<typeof Env>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = Env.safeParse(source);
  if (!parsed.success) {
    const lines = parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid environment:\n${lines}`);
  }
  return parsed.data;
}
