import { z } from "zod";
import { publicProcedure, router } from "../../trpc/procedures";
import { listProfessionals, listVerifiedHelplines } from "./service";

export const directoryRouter = router({
  list: publicProcedure
    .input(
      z.object({
        lang: z.enum(["tg", "ru", "en"]).optional(),
        format: z.enum(["online", "in_person", "both"]).optional(),
        cursor: z.string().max(80).optional(),
        limit: z.number().int().min(1).max(50).default(20),
      }),
    )
    .query(({ ctx, input }) => listProfessionals(ctx.db, input)),
  helplines: publicProcedure.query(({ ctx }) => listVerifiedHelplines(ctx.db)),
});
