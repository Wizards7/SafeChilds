import { z } from "zod";
import { publicProcedure, router } from "../../trpc/procedures";
import { triage } from "./service";

// The guided chat: the kid's own turns so far, codes back. Nothing is stored.
export const triageRouter = router({
  reply: publicProcedure
    .input(z.object({ messages: z.array(z.string().trim().min(1).max(600)).min(1).max(8) }))
    .mutation(({ ctx, input }) => triage({ model: ctx.triage, log: ctx.log }, input.messages)),
});
