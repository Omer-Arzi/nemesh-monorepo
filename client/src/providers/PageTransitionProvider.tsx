"use client";

import { createContext, useContext, useCallback, useRef } from "react";

export type ShellVisualState = {
  pageMode: "home" | "standard";
  desktopHeaderVisible: boolean;
  railStickyTop: 0 | 64;
};

type PageTransitionContextValue = {
  /**
   * For useSyncExternalStore. Intentionally never calls onChange — no
   * currently-mounted AppShell instance needs to react to a later publish;
   * each instance only ever needs its OWN previous value, read once, at its
   * own first render. This is what makes it safe to read as a plain
   * useSyncExternalStore snapshot instead of a ref access during render.
   */
  subscribe: (onChange: () => void) => () => void;
  getSnapshot: () => ShellVisualState | null;
  /** Always null: SSR/hydration must never see a "previous" shell state. */
  getServerSnapshot: () => ShellVisualState | null;
  publishShellState: (state: ShellVisualState) => void;
};

const PageTransitionContext = createContext<PageTransitionContextValue | undefined>(undefined);

const noop = () => {};
const subscribe = () => noop;
const getServerSnapshot = () => null;

/**
 * Lets a freshly-mounted AppShell instance (see AppShell.tsx) reconstruct a
 * smooth visual transition across a route-group boundary, without any of
 * this ever influencing SSR/hydration output.
 *
 * Backed by a ref, not useState: publishing must never re-render this
 * provider (it sits above every route, so a state-based version would
 * cascade a re-render through the whole app on every scroll-driven
 * visibility change). AppShell reads it via useSyncExternalStore — the
 * React-sanctioned way to safely read external mutable ref-like data during
 * render, rather than touching `.current` directly during render (unsafe)
 * or bouncing it through a useEffect + setState (a derived-state anti-pattern).
 *
 * Mounted once in RootProviders, so it never remounts across navigation —
 * unlike AppShell, which remounts per route group by design (see
 * docs/architecture.md §9b).
 */
export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const previousShellStateRef = useRef<ShellVisualState | null>(null);

  const getSnapshot = useCallback(() => previousShellStateRef.current, []);
  const publishShellState = useCallback((state: ShellVisualState) => {
    previousShellStateRef.current = state;
  }, []);

  return (
    <PageTransitionContext.Provider
      value={{ subscribe, getSnapshot, getServerSnapshot, publishShellState }}
    >
      {children}
    </PageTransitionContext.Provider>
  );
}

export function usePageTransition(): PageTransitionContextValue {
  const context = useContext(PageTransitionContext);
  if (!context) {
    throw new Error("usePageTransition must be used within PageTransitionProvider");
  }
  return context;
}
