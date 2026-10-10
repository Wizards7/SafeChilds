import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { schema } from "@safechilds/db";
import { publicProcedure, router } from "../../trpc/procedures";

export const reportsRouter = router({
  create: publicProcedure
    .input(z.object({ professionalId: z.string().uuid(), reason: z.string().trim().min(3).max(500) }))
    .mutation(async ({ ctx, input }) => {
      const [p] = await ctx.db
        .select({ id: schema.professionals.id })
        .from(schema.professionals)
        .where(eq(schema.professionals.id, input.professionalId))
        .limit(1);
      if (!p) throw new TRPCError({ code: "NOT_FOUND", message: "professional not found" });
      await ctx.db.insert(schema.listingReports).values({ professionalId: input.professionalId, reason: input.reason });
      return { ok: true as const };
    }),
});
