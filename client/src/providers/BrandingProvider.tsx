"use client";

import { createContext, useContext } from "react";
import type { SiteBranding } from "@/types/domain";

const DEFAULT_BRANDING: SiteBranding = { logo: null, mobileLogo: null };

const BrandingContext = createContext<SiteBranding>(DEFAULT_BRANDING);

export function BrandingProvider({
  branding,
  children,
}: {
  branding: SiteBranding;
  children: React.ReactNode;
}) {
  return (
    <BrandingContext.Provider value={branding}>
      {children}
    </BrandingContext.Provider>
  );
}

/** Returns admin-managed branding assets; both fields may be null. */
export function useBranding(): SiteBranding {
  return useContext(BrandingContext);
}
