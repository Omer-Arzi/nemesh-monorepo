"use client";

import Box from "@mui/material/Box";
import { usePathname } from "next/navigation";
import Footer from "../Footer";
import Header from "../Header";
import NavigationRail from "../NavigationRail";
import { useUiStore } from "@/stores/uiStore";
import { AppShellStyle } from "./styles/AppShellStyle";
import { HEADER } from "../Header/styles/HeaderStyle";

type Props = {
  children: React.ReactNode;
};

/**
 * Root application shell.
 *
 * Layout (RTL flex row):
 *   Header (sticky)
 *   ┌───────────────────────┬────────┐
 *   │  main + footer        │  Rail  │  ← RTL flex puts first child on right
 *   │  (flex: 1)            │ sticky │
 *   └───────────────────────┴────────┘
 *
 * The NavigationRail is `position: sticky` so it stays on screen while
 * the content area scrolls.  As a flex sibling it takes up real layout
 * space — the content area shrinks/grows naturally with the rail width.
 * No padding hacks needed.
 */
export default function AppShell({ children }: Props) {
  const navRailOpen = useUiStore((s) => s.navRailOpen);
  const toggleNavRail = useUiStore((s) => s.toggleNavRail);
  const homeStickyHeaderVisible = useUiStore((s) => s.homeStickyHeaderVisible);
  const pathname = usePathname();
  const isHomepage = pathname === "/";
  // On the homepage the AppShell Header is hidden on desktop.
  // When the homepage sticky header is covering the viewport top, offset the
  // sidebar by its exact height so the first nav item stays fully visible.
  const railStickyTop = isHomepage
    ? (homeStickyHeaderVisible ? HEADER.DESKTOP_COMPACT_HEIGHT : 0)
    : undefined;

  return (
    <Box sx={AppShellStyle.root}>
      <Header />

      <Box sx={AppShellStyle.body}>
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
