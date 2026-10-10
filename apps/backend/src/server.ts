import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import { fastifyTRPCPlugin, type FastifyTRPCPluginOptions } from "@trpc/server/adapters/fastify";
import { createDb, type Db } from "@safechilds/db";
import { sql } from "drizzle-orm";
import Fastify, { type FastifyError } from "fastify";
import type { Env } from "./env";
import { createAnthropicClient } from "./modules/analysis/anthropic";
import { registerAnalysisRoute } from "./modules/analysis/route";
import type { ModelClient } from "./modules/analysis/service";
import { makeCreateContext } from "./trpc/context";
import { appRouter, type AppRouter } from "./trpc/router";

export interface BuildOptions {
  db?: Db;
  model?: ModelClient | null;
}

export async function buildApp(env: Env, opts: BuildOptions = {}) {
  const app = Fastify({
    logger: env.NODE_ENV !== "test",
    bodyLimit: 1024 * 1024,
    // Request lines log method + path only. Bodies (an image, a pasted URL) are never logged.
  });

  const db = opts.db ?? createDb(env.DATABASE_URL);
  const model = opts.model !== undefined ? opts.model : env.ANTHROPIC_API_KEY ? createAnthropicClient(env.ANTHROPIC_API_KEY, env.ANTHROPIC_MODEL) : null;

  await app.register(cors, { origin: env.CORS_ORIGINS, credentials: false });
  await app.register(rateLimit, { max: 60, timeWindow: "1 minute", allowList: [] });
  await app.register(multipart);

  app.get("/healthz", async () => ({ ok: true }));
  // readyz depends on our own database only. A third-party outage must never take the API out of rotation.
  app.get("/readyz", async (_req, reply) => {
    try {
      await db.execute(sql`select 1`);
      return { ok: true };
    } catch {
      return reply.code(503).send({ ok: false });
    }
  });

  await app.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    trpcOptions: {
      router: appRouter,
      createContext: makeCreateContext({ db, env }),
      onError({ path, error }) {
        app.log.warn({ path, code: error.code }, "trpc error");
      },
    } satisfies FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
  });

  registerAnalysisRoute(app, { db, model, log: { warn: (m) => app.log.warn(m) } });

  app.setErrorHandler((err: FastifyError, _req, reply) => {
    // Clients get a code and a clean message. Details stay in the server log.
    app.log.error({ err }, "unhandled");
    const status = typeof err.statusCode === "number" && err.statusCode >= 400 ? err.statusCode : 500;
    reply.code(status).send({ code: status === 429 ? "RATE_LIMITED" : "INTERNAL", message: status === 429 ? "too many requests" : "something went wrong" });
  });

  return app;
}
