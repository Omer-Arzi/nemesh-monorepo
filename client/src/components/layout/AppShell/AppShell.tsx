"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import Box from "@mui/material/Box";
import Footer from "../Footer";
import Header from "../Header";
import NavigationRail from "../NavigationRail";
import DesktopCompactHeader from "../DesktopCompactHeader";
import { useUiStore } from "@/stores/uiStore";
import { HomeHeroVisibilityProvider } from "@/providers/HomeHeroVisibilityProvider";
import { usePageTransition } from "@/providers/PageTransitionProvider";
import { AppShellStyle } from "./styles/AppShellStyle";
import { HEADER } from "../Header/styles/HeaderStyle";

type TransitionSeed = { visible: boolean; railTop: 0 | 64 };

type PageMode = "home" | "standard";

type Props = {
  pageMode: PageMode;
  children: React.ReactNode;
};

/**
 * Root application shell — one instance per route group ((home) or
 * (standard) — see src/app/(home)/layout.tsx and src/app/(standard)/layout.tsx),
 * persistent across client-side navigation *within* a group.
 *
 * `pageMode` is a hardcoded literal passed in by whichever group layout
 * renders this component — never derived from usePathname(). A usePathname()
 * read inside this "use client" component proved unreliable during SSR/ISR
 * (it could resolve to a non-home value while rendering the actual homepage
 * content), which baked the wrong layout into the cached static HTML for "/".
 * Route groups make Next's own file-system router the source of truth
 * instead: (home)/layout.tsx can only ever render for "/", by construction.
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
 *   — always true in pageMode="standard"
 *   — true in pageMode="home" only after the hero scrolls past
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
 *
 * Crossing between route groups (home ↔ standard) unmounts and remounts
 * this component — see docs/architecture.md for what that costs, and the
 * transition-reconstruction block below for how visual continuity is
 * restored across that remount without reintroducing any SSR-critical
 * route inference.
 */
export default function AppShell({ pageMode, children }: Props) {
  const navRailOpen = useUiStore((s) => s.navRailOpen);
  const toggleNavRail = useUiStore((s) => s.toggleNavRail);
  // Owned locally (not in the global store) so every server render — build,
  // ISR revalidation, or otherwise — starts from a deterministic `true`.
  // A useState initializer runs fresh per component instance; there is no
  // module-scoped object here for a reused server process to have mutated.
  const [isHomeHeroVisible, setHomeHeroVisible] = useState(true);
  const isHomepage = pageMode === "home";

  // The compact desktop header is visible whenever we're not on the homepage,
  // OR when we're on the homepage but the hero has scrolled out of view.
  // These are the ONLY values that ever determine SSR/hydration output —
  // everything below this point is a purely client-side visual overlay on
  // top of them and never feeds back into these two variables.
  const targetDesktopHeaderVisible = !isHomepage || !isHomeHeroVisible;
  const targetRailStickyTop: 0 | 64 = targetDesktopHeaderVisible
    ? HEADER.DESKTOP_COMPACT_HEIGHT
    : 0;

  // --- Transition reconstruction (client-only, never affects SSR output) ---
  //
  // Crossing a route-group boundary unmounts the old AppShell and mounts a
  // new one with no shared DOM node to CSS-transition from. This restores
  // that continuity: the new instance briefly renders the previous
  // instance's last published visual state, then releases to its own real
  // target on the next frame, letting the existing opacity/transform/top
  // transitions animate the change exactly as they do for the scroll-driven
  // show/hide within a single page.
  //
  // `transitionSeed` is null except during that brief entrance window.
  const { subscribe, getSnapshot, getServerSnapshot, publishShellState } = usePageTransition();

  // useSyncExternalStore, not a raw ref read or an effect+setState: this is
  // the React-sanctioned way to safely read external mutable ref-like data
  // during render. getServerSnapshot always returns null, so SSR/hydration
  // is guaranteed to never see a "previous" state — the initial render
  // above is already correct entirely on its own regardless of what this
  // resolves to. `subscribe` never actually notifies (see
  // PageTransitionProvider), so this can never trigger a re-render later —
  // it is read exactly once, at this component instance's first render.
  const previousShellState = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const [transitionSeed, setTransitionSeed] = useState<TransitionSeed | null>(() => {
    if (typeof window === "undefined") return null; // never seed during SSR
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
    if (!previousShellState) return null; // first-ever mount this tab/session
    const alreadyMatches =
      previousShellState.desktopHeaderVisible === targetDesktopHeaderVisible &&
      previousShellState.railStickyTop === targetRailStickyTop;
    if (alreadyMatches) return null; // continuous already — no animation needed
    return { visible: previousShellState.desktopHeaderVisible, railTop: previousShellState.railStickyTop };
  });

  // Release the seed on the next frame so CSS transitions from the seeded
  // (previous) values to whatever the real target currently is — which
  // naturally picks up any later correction (e.g. HomeHeroSection's
  // IntersectionObserver) once transitionSeed is cleared, since after that
  // this component always renders the real target values.
  useEffect(() => {
    if (transitionSeed === null) return;
    const raf = requestAnimationFrame(() => setTransitionSeed(null));
    return () => cancelAnimationFrame(raf);
  }, [transitionSeed]);

  // Publish the real target — never the transitional seed — so the next
  // AppShell instance always animates from the true settled state. Runs on
  // every change (scrolling on the homepage included), which inherently
  // keeps this current up to the moment this instance unmounts.
  useEffect(() => {
    publishShellState({
      pageMode,
      desktopHeaderVisible: targetDesktopHeaderVisible,
      railStickyTop: targetRailStickyTop,
    });
  }, [pageMode, targetDesktopHeaderVisible, targetRailStickyTop, publishShellState]);

  const isDesktopHeaderVisible = transitionSeed ? transitionSeed.visible : targetDesktopHeaderVisible;
  const railStickyTop = transitionSeed ? transitionSeed.railTop : targetRailStickyTop;

  return (
    <Box sx={AppShellStyle.root}>
      {/* Mobile-only AppBar (hamburger + mobile logo).
          DesktopCompactHeader handles all desktop navigation. */}
      <Header />

      {/* Desktop compact header. Mounted for the lifetime of this AppShell
          instance, so search state and transitions persist across
          navigation within the same route group (home or standard) — but
          reset when crossing between groups, since AppShell itself remounts
          then. See docs/architecture.md. */}
      <DesktopCompactHeader visible={isDesktopHeaderVisible} />

      {/* Body: NavigationRail + page content.
          On non-home pages, paddingTop reserves space beneath the fixed
          compact header on desktop.  Homepage has no padding — the hero
          fills the top, and the compact header overlays when scrolled. */}
      <Box
        sx={{
          ...AppShellStyle.body,
          paddingTop: isHomepage ? 0 : { xs: 0, md: `${HEADER.DESKTOP_COMPACT_HEIGHT}px` },
        }}
      >
        {/* RTL flex: first child lands on the physical right side */}
        <NavigationRail open={navRailOpen} onToggle={toggleNavRail} stickyTop={railStickyTop} />

        <Box sx={AppShellStyle.content}>
          <Box component="main" sx={AppShellStyle.main}>
            {/* Exposes the locally-owned hero-visibility state down to
                HomeHeroSection (rendered inside children on the homepage)
                without going through global module-scoped state. */}
            <HomeHeroVisibilityProvider
              isHomeHeroVisible={isHomeHeroVisible}
              setHomeHeroVisible={setHomeHeroVisible}
            >
              {children}
            </HomeHeroVisibilityProvider>
          </Box>
          <Footer />
        </Box>
      </Box>
    </Box>
  );
}
