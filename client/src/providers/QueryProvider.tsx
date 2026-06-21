"use client";

import {
  QueryClientProvider,
  isServer,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { makeQueryClient } from "@/lib/query";

/**
 * TanStack Query provider following the Next.js App Router pattern.
 *
 * Why a ref-like singleton on the browser: we want one QueryClient per
 * browser tab, but a new one per server request.  The `isServer` guard from
 * TanStack achieves this without a module-level variable that would leak
 * across requests.
 *
 * DevTools are tree-shaken in production builds automatically.
 */

// Server-side: create a fresh client per request (no singleton).
// Browser-side: stable across re-renders via useState.
function getQueryClient() {
  if (isServer) return makeQueryClient();
  // useState initialiser runs only once per mount on the browser.
  return makeQueryClient();
}

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // useState so the client is stable on the browser without a module singleton.
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
