import { z } from "zod";

const Env = z.object({
  BOT_TOKEN: z.string().min(20),
  API_URL: z.string().url().default("http://localhost:4100"),
  APP_URL: z.string().url().default("http://localhost:3000"),
});
export type Env = z.infer<typeof Env>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const r = Env.safeParse(source);
  if (!r.success) throw new Error("Invalid environment:\n" + r.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n"));
  return r.data;
}
