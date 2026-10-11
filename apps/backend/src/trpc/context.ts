import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import type { Db } from "@safechilds/db";
import type { Env } from "../env";
import type { TextModelClient } from "../modules/triage/service";

export interface Services {
  db: Db;
  env: Env;
  log: { warn: (msg: string) => void };
  triage: TextModelClient | null; // null until ANTHROPIC_API_KEY exists
}

export function makeCreateContext(services: Services) {
  return ({ req }: CreateFastifyContextOptions) => ({
    db: services.db,
    env: services.env,
    log: services.log,
    triage: services.triage,
    ip: req.ip,
  });
}

export type Context = ReturnType<ReturnType<typeof makeCreateContext>>;
