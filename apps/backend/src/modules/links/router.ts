import { z } from "zod";
import { publicProcedure, router } from "../../trpc/procedures";
import { checkLink } from "./service";

export const linksRouter = router({
  check: publicProcedure
    .input(z.object({ url: z.string().trim().min(4).max(2048) }))
    .mutation(({ input }) => checkLink({ fetch, now: () => new Date() }, input.url)),
});
