import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink, splitLink, httpLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "@/server/routers";
import { getApiBaseUrl } from "@/constants/oauth";
import * as Auth from "@/lib/_core/auth";

/**
 * tRPC React client for type-safe API calls.
 *
 * IMPORTANT (tRPC v11): The `transformer` must be inside `httpBatchLink`,
 * NOT at the root createClient level. This ensures client and server
 * use the same serialization format (superjson).
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Creates the tRPC client with proper configuration.
 * Call this once in your app's root layout.
 */
export function createTRPCClient() {
  const commonOptions = {
    url: `${getApiBaseUrl()}/api/trpc`,
    transformer: superjson,
    async headers() {
      const token = await Auth.getSessionToken();
      return token ? { Authorization: `Bearer ${token}` } : {};
    },
    fetch(url: RequestInfo | URL, options?: RequestInit) {
      return fetch(url, {
        ...options,
        credentials: "include",
      });
    },
  };

  return trpc.createClient({
    links: [
      splitLink({
        // Use httpLink (non-batched) for mutations to ensure POST
        condition: (op) => op.type === "mutation",
        true: httpLink(commonOptions),
        // Use httpBatchLink for queries (can use GET)
        false: httpBatchLink(commonOptions),
      }),
    ],
  });
}
