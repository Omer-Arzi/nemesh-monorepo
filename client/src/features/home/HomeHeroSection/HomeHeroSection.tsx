"use client";

import { useState, useEffect, useRef } from "react";
import type { Image } from "@/types/domain";
import HomeSearchHero from "@/features/home/HomeSearchHero";
import HomeStickyHeader from "@/features/home/HomeStickyHeader";
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
 * `HomeStickyHeader` becomes visible. When the sentinel re-enters, it hides.
 *
 * Using IntersectionObserver instead of a scroll listener avoids layout
 * thrashing and does not need throttling or cleanup concerns on resize.
 */
export default function HomeHeroSection({ title, subtitle, backgroundImage }: Props) {
  const [heroPassed, setHeroPassed] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const setHomeStickyHeaderVisible = useUiStore((s) => s.setHomeStickyHeaderVisible);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        // Distinguish "sentinel above viewport" (scrolled past) from
        // "sentinel below viewport" (page loaded without scrolling but hero
        // is taller than the viewport).
        const next = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        setHeroPassed(next);
        setHomeStickyHeaderVisible(next);
      },
      { threshold: 0 }
    );

    obs.observe(el);
    return () => {
      obs.disconnect();
      // Reset when leaving the homepage so AppShell doesn't carry stale offset.
      setHomeStickyHeaderVisible(false);
    };
  }, [setHomeStickyHeaderVisible]);

  return (
    <>
      <HomeSearchHero title={title} subtitle={subtitle} backgroundImage={backgroundImage} />
      {/* Sentinel: positioned right after the hero bottom edge */}
      <div ref={sentinelRef} aria-hidden="true" style={{ pointerEvents: "none" }} />
      <HomeStickyHeader visible={heroPassed} />
    </>
  );
}
