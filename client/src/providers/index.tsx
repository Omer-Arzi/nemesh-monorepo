/**
 * Composing all providers in one place.
 *
 * Why a single RootProvider: the root layout stays clean — it mounts one
 * component and doesn't need to know which libraries are wired beneath.
 * Adding a new global provider means editing only this file.
 *
 * Order matters:
 *  1. EmotionRegistry  — must be outermost to capture all Emotion styles
 *  2. MuiProvider      — depends on Emotion cache being set up
 *  3. QueryProvider    — independent; outermost for data concerns
 *
 * TODO: Add an AuthProvider here once authentication is implemented.
 */
"use client";

import EmotionRegistry from "./EmotionRegistry";
import MuiProvider from "./MuiProvider";
import QueryProvider from "./QueryProvider";

export default function RootProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EmotionRegistry>
      <MuiProvider>
        <QueryProvider>{children}</QueryProvider>
      </MuiProvider>
    </EmotionRegistry>
  );
}

export { EmotionRegistry, MuiProvider, QueryProvider };
