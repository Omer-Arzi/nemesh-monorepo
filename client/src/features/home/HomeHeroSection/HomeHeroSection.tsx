"use client";

import { useEffect, useRef } from "react";
import type { Image } from "@/types/domain";
import HomeSearchHero from "@/features/home/HomeSearchHero";
import { useUiStore } from "@/stores/uiStore";

type Props = {
  title?: string | null;
  subtitle?: string | null;
  backgroundImage?: Image | null;
};

/**
 * Wraps the homepage hero section with scroll-based visibility tracking.
 *
 * A sentinel element is placed immediately after the hero. When the sentinel
 * leaves the viewport through the top (hero has fully scrolled past),
 * `isHomeHeroVisible` is set to false — which causes the shared
 * DesktopCompactHeader in AppShell to become visible.  When the sentinel
 * re-enters, it reverts to true and the compact header hides.
 *
 * Using IntersectionObserver instead of a scroll listener avoids layout
 * thrashing and does not need throttling.
 *
 * The DesktopCompactHeader itself is NOT rendered here — it lives in
 * AppShell so it persists across route changes.
 */
export default function HomeHeroSection({ title, subtitle, backgroundImage }: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const setHomeHeroVisible = useUiStore((s) => s.setHomeHeroVisible);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        // Distinguish "sentinel above viewport" (scrolled past) from
        // "sentinel below viewport" (page loaded without scrolling but hero
        // is taller than the viewport).
        const heroPassed = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        // hero visible = hero has not fully scrolled past
        setHomeHeroVisible(!heroPassed);
      },
      { threshold: 0 }
    );

    obs.observe(el);
    // No cleanup reset: the stale isHomeHeroVisible value is preserved on
    // unmount so the shell keeps showing the compact header during navigation
    // away from a scrolled homepage.  AppShell ignores isHomeHeroVisible on
    // non-home routes (route context always wins there).
    return () => obs.disconnect();
  }, [setHomeHeroVisible]);

  return (
    <>
      <HomeSearchHero title={title} subtitle={subtitle} backgroundImage={backgroundImage} />
      {/* Sentinel: positioned right after the hero bottom edge */}
      <div ref={sentinelRef} aria-hidden="true" style={{ pointerEvents: "none" }} />
    </>
  );
}
