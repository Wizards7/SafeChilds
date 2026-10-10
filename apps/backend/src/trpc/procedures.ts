// `public` and `admin` are defined once. For the hackathon only `public` is used; `admin` throws until the CRM returns.

import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape }) {
    // Clients get a code and a clean message; stack traces and SQL stay in server logs.
    return { ...shape, data: { code: shape.data.code, httpStatus: shape.data.httpStatus } };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const adminProcedure = t.procedure.use(() => {
  throw new TRPCError({ code: "FORBIDDEN", message: "admin surface is deferred with the CRM" });
});
