"use client";

import { useEffect } from "react";
import { analytics } from "./Ga4AnalyticsAdapter";
import type { PageViewParams } from "./Ga4AnalyticsAdapter";

// Drop-in for server components that cannot call useEffect directly.
// Renders nothing — fires trackPageView once on mount.
export default function PageViewTracker(params: PageViewParams) {
  useEffect(() => {
    analytics.trackPageView(params);
    // params is stable (plain literals passed from a server component), no re-fire needed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
