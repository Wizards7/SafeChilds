import { router } from "./procedures";
import { directoryRouter } from "../modules/directory/router";
import { linksRouter } from "../modules/links/router";
import { reportsRouter } from "../modules/reports/router";
import { triageRouter } from "../modules/triage/router";

export const appRouter = router({
  directory: directoryRouter,
  reports: reportsRouter,
  links: linksRouter,
  triage: triageRouter,
});

export type AppRouter = typeof appRouter;
