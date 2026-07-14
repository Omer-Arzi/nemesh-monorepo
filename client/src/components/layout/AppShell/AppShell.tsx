"use client";

import { useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import { usePathname } from "next/navigation";
import Footer from "../Footer";
import Header from "../Header";
import NavigationRail from "../NavigationRail";
import DesktopCompactHeader from "../DesktopCompactHeader";
import { useUiStore } from "@/stores/uiStore";
import { AppShellStyle } from "./styles/AppShellStyle";
import { HEADER } from "../Header/styles/HeaderStyle";

// TEMP DEBUG — layout bug investigation. Remove before commit.
function debugLog(tag: string, data: Record<string, unknown>) {
  if (typeof window === "undefined") return; // render also runs during SSR — skip there
  // eslint-disable-next-line no-console
  console.log(
    `%c[layout-debug]%c ${tag}`,
    "color:#e91e63;font-weight:bold",
    "color:inherit",
    { t: Math.round(performance.now()), visibilityState: document.visibilityState, ...data }
  );
}

type Props = {
  children: React.ReactNode;
};

/**
 * Root application shell — persistent across all client-side route changes.
 *
 * Layout (flex column):
 *   Header (AppBar, mobile-only: display:{ md:'none' })
 *   DesktopCompactHeader (position:fixed, desktop-only, logo + search)
 *   ┌───────────────────────┬────────┐  ← flex row (body)
 *   │  main + footer        │  Rail  │  ← RTL flex puts first child on right
 *   │  (flex: 1)            │ sticky │
 *   └───────────────────────┴────────┘
 *
 * Visibility rule for the desktop compact header:
 *   isDesktopHeaderVisible = !isHomepage || !isHomeHeroVisible
 *   — always true on non-home routes
 *   — true on homepage only after the hero scrolls past
 *
 * Content offset:
 *   On non-home pages the body reserves paddingTop equal to the compact
 *   header height so content never sits underneath the fixed header.
 *   On the homepage no padding is added — the hero fills the top and the
 *   fixed header overlays scrolled content (no document jump on appear).
 *
 * Sidebar offset:
 *   The NavigationRail stickyTop mirrors isDesktopHeaderVisible (0 or 64px)
 *   and animates with a matching CSS transition so header and sidebar move
 *   in sync.
 */
export default function AppShell({ children }: Props) {
  const navRailOpen = useUiStore((s) => s.navRailOpen);
  const toggleNavRail = useUiStore((s) => s.toggleNavRail);
  const isHomeHeroVisible = useUiStore((s) => s.isHomeHeroVisible);
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  // The compact desktop header is visible whenever we're not on the homepage,
  // OR when we're on the homepage but the hero has scrolled out of view.
  const isDesktopHeaderVisible = !isHomepage || !isHomeHeroVisible;

  // Sidebar top offset tracks the same resolved state with a CSS transition.
  const railStickyTop = isDesktopHeaderVisible ? HEADER.DESKTOP_COMPACT_HEIGHT : 0;

  // TEMP DEBUG — log every render's derived state.
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;
  debugLog("AppShell render", {
    n: renderCountRef.current,
    pathname,
    isHomepage,
    navRailOpen,
    isHomeHeroVisible,
    isDesktopHeaderVisible,
    railStickyTop,
  });

  // TEMP DEBUG — one-time: navigation timing + page lifecycle events.
  useEffect(() => {
    const nav = performance.getEntriesByType("navigation")[0];
    debugLog("navigation timing", {
      nav: nav ? JSON.parse(JSON.stringify(nav)) : null,
      // "navigate" = normal load, "reload", "back_forward" = bfcache/history restore
      navType: (nav as PerformanceNavigationTiming | undefined)?.type,
    });

    const onPageShow = (e: PageTransitionEvent) =>
      debugLog("pageshow", { persisted: e.persisted });
    const onPageHide = (e: PageTransitionEvent) =>
      debugLog("pagehide", { persisted: e.persisted });
    const onVisibility = () =>
      debugLog("visibilitychange", { visibilityState: document.visibilityState });
    const onFocus = () => debugLog("focus", {});

    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const bodyRef = useRef<HTMLDivElement>(null);

  // TEMP DEBUG — computed layout values after paint, whenever derived state changes.
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const bodyEl = bodyRef.current;
      const railEl = bodyEl?.querySelector<HTMLElement>('[data-debug="nav-rail"]');
      const compactHeaderEl = document.querySelector<HTMLElement>(
        '[data-debug="desktop-compact-header"]'
      );
      const mobileHeaderEl = document.querySelector<HTMLElement>(
        '[data-debug="mobile-header"]'
      );

      const describe = (el: HTMLElement | null | undefined) => {
        if (!el) return null;
        const cs = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          display: cs.display,
          position: cs.position,
          top: cs.top,
          opacity: cs.opacity,
          visibility: cs.visibility,
          transform: cs.transform,
          width: cs.width,
          rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        };
      };

      debugLog("computed layout (post-paint)", {
        bodyPaddingTop: bodyEl ? getComputedStyle(bodyEl).paddingTop : null,
        rail: describe(railEl),
        compactHeader: describe(compactHeaderEl),
        mobileHeader: describe(mobileHeaderEl),
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname, isHomepage, navRailOpen, isHomeHeroVisible, isDesktopHeaderVisible, railStickyTop]);

  return (
    <Box sx={AppShellStyle.root}>
      {/* Mobile-only AppBar (hamburger + mobile logo).
          DesktopCompactHeader handles all desktop navigation. */}
      <Header />

      {/* Persistent desktop compact header.  Always mounted so search state
          and transitions are preserved across route changes. */}
      <DesktopCompactHeader visible={isDesktopHeaderVisible} />

      {/* Body: NavigationRail + page content.
          On non-home pages, paddingTop reserves space beneath the fixed
          compact header on desktop.  Homepage has no padding — the hero
          fills the top, and the compact header overlays when scrolled. */}
      <Box
        ref={bodyRef}
        sx={{
          ...AppShellStyle.body,
          paddingTop: isHomepage ? 0 : { xs: 0, md: `${HEADER.DESKTOP_COMPACT_HEIGHT}px` },
        }}
      >
        {/* RTL flex: first child lands on the physical right side */}
        <NavigationRail open={navRailOpen} onToggle={toggleNavRail} stickyTop={railStickyTop} />

        <Box sx={AppShellStyle.content}>
          <Box component="main" sx={AppShellStyle.main}>
            {children}
          </Box>
          <Footer />
        </Box>
      </Box>
    </Box>
  );
}
