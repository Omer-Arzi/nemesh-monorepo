"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import { usePathname } from "next/navigation";
import Footer from "../Footer";
import Header from "../Header";
import NavigationRail from "../NavigationRail";
import DesktopCompactHeader from "../DesktopCompactHeader";
import { useUiStore } from "@/stores/uiStore";
import { HomeHeroVisibilityProvider } from "@/providers/HomeHeroVisibilityProvider";
import { AppShellStyle } from "./styles/AppShellStyle";
import { HEADER } from "../Header/styles/HeaderStyle";

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
  // Owned locally (not in the global store) so every server render — build,
  // ISR revalidation, or otherwise — starts from a deterministic `true`.
  // A useState initializer runs fresh per component instance; there is no
  // module-scoped object here for a reused server process to have mutated.
  const [isHomeHeroVisible, setHomeHeroVisible] = useState(true);
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  // The compact desktop header is visible whenever we're not on the homepage,
  // OR when we're on the homepage but the hero has scrolled out of view.
  const isDesktopHeaderVisible = !isHomepage || !isHomeHeroVisible;

  // Sidebar top offset tracks the same resolved state with a CSS transition.
  const railStickyTop = isDesktopHeaderVisible ? HEADER.DESKTOP_COMPACT_HEIGHT : 0;

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
