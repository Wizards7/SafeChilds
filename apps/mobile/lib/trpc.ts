"use client";

import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import type { AppRouter } from "@safechilds/backend/router";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4100";

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

export function makeTrpcClient() {
  return createTRPCClient<AppRouter>({
    links: [httpBatchLink({ url: `${API_URL}/trpc` })],
  });
}
