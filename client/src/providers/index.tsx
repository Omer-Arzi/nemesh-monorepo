/**
 * Composing all providers in one place.
 *
 * Why a single RootProvider: the root layout stays clean — it mounts one
 * component and doesn't need to know which libraries are wired beneath.
 * Adding a new global provider means editing only this file.
 *
 * Order matters:
 *  1. EmotionRegistry       — must be outermost to capture all Emotion styles
 *  2. MuiProvider           — depends on Emotion cache being set up
 *  3. QueryProvider         — independent; outermost for data concerns
 *  4. BrandingProvider      — inside QueryProvider; logo data is layout-level
 *  5. PageTransitionProvider — must be here (not inside AppShell) so it
 *     survives AppShell remounting across route groups; see AppShell.tsx
 *     and docs/architecture.md §9b.
 *
 * TODO: Add an AuthProvider here once authentication is implemented.
 */
"use client";

import EmotionRegistry from "./EmotionRegistry";
import MuiProvider from "./MuiProvider";
import QueryProvider from "./QueryProvider";
import { BrandingProvider } from "./BrandingProvider";
import { PageTransitionProvider } from "./PageTransitionProvider";
import type { ThemePresetKey } from "@/lib/theme/themePresets";
import type { SiteBranding } from "@/types/domain";

export default function RootProviders({
  children,
  activePresetKey,
  branding,
}: {
  children: React.ReactNode;
  activePresetKey?: ThemePresetKey;
  branding?: SiteBranding;
}) {
  return (
    <EmotionRegistry>
      <MuiProvider activePresetKey={activePresetKey}>
        <QueryProvider>
          <BrandingProvider branding={branding ?? { logo: null, mobileLogo: null }}>
            <PageTransitionProvider>{children}</PageTransitionProvider>
          </BrandingProvider>
        </QueryProvider>
      </MuiProvider>
    </EmotionRegistry>
  );
}

export { EmotionRegistry, MuiProvider, QueryProvider, BrandingProvider, PageTransitionProvider };
