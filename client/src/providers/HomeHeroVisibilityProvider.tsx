"use client";

import { createContext, useContext } from "react";

type HomeHeroVisibilityContextValue = {
  isHomeHeroVisible: boolean;
  setHomeHeroVisible: (visible: boolean) => void;
};

const HomeHeroVisibilityContext = createContext<HomeHeroVisibilityContextValue | undefined>(
  undefined
);

/**
 * Exposes AppShell-owned hero-visibility state (and its setter) down to
 * HomeHeroSection, without routing it through global module-scoped state.
 *
 * AppShell owns the `useState` and passes both values in as props here —
 * a fresh `useState(true)` per request/component instance is what keeps the
 * server-rendered homepage deterministic (see AppShell.tsx for details).
 */
export function HomeHeroVisibilityProvider({
  isHomeHeroVisible,
  setHomeHeroVisible,
  children,
}: HomeHeroVisibilityContextValue & { children: React.ReactNode }) {
  return (
    <HomeHeroVisibilityContext.Provider value={{ isHomeHeroVisible, setHomeHeroVisible }}>
      {children}
    </HomeHeroVisibilityContext.Provider>
  );
}

export function useHomeHeroVisibility(): HomeHeroVisibilityContextValue {
  const context = useContext(HomeHeroVisibilityContext);

  if (!context) {
    throw new Error("useHomeHeroVisibility must be used within HomeHeroVisibilityProvider");
  }

  return context;
}
