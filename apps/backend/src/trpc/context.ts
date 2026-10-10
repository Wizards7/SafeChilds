import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import type { Db } from "@safechilds/db";
import type { Env } from "../env";

export interface Services {
  db: Db;
  env: Env;
}

export function makeCreateContext(services: Services) {
  return ({ req }: CreateFastifyContextOptions) => ({
    db: services.db,
    env: services.env,
    ip: req.ip,
  });
}

export type Context = ReturnType<ReturnType<typeof makeCreateContext>>;
