import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@safechilds/backend/router";

export function makeApi(apiUrl: string) {
  return createTRPCClient<AppRouter>({ links: [httpBatchLink({ url: `${apiUrl}/trpc` })] });
}
export type Api = ReturnType<typeof makeApi>;
