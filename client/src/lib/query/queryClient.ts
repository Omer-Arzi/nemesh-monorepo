import { QueryClient } from "@tanstack/react-query";

/**
 * Factory that creates a QueryClient with project-wide defaults.
 *
 * Why a factory instead of a singleton: Next.js App Router renders on both
 * server and client; a module-level singleton leaks data between requests on
 * the server.  Each server render gets its own instance; the browser reuses
 * the one created inside the provider.
 *
 * What belongs here: staleTime, gcTime, retry policy, error handler.
 *
 * What does NOT belong here: query keys or fetcher functions — those live
 * in their respective feature or service files.
 */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 60 seconds before a background refetch.
        // TODO: adjust per resource type as needed.
        staleTime: 60 * 1000,

        // Retain cached data for 5 minutes after the last subscriber unmounts.
        gcTime: 5 * 60 * 1000,

        // Retry once on network errors; don't retry 4xx responses.
        retry: (failureCount, error) => {
          const status = (error as { status?: number }).status;
          if (status !== undefined && status >= 400 && status < 500) return false;
          return failureCount < 1;
        },

        refetchOnWindowFocus: false,
      },

      mutations: {
        retry: false,
      },
    },
  });
}
