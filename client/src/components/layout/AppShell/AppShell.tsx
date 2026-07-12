"use client";

import Box from "@mui/material/Box";
import { usePathname } from "next/navigation";
import Footer from "../Footer";
import Header from "../Header";
import NavigationRail from "../NavigationRail";
import { useUiStore } from "@/stores/uiStore";
import { AppShellStyle } from "./styles/AppShellStyle";

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
  const pathname = usePathname();
  // On the homepage the AppShell Header is hidden on desktop, so the sidebar
  // should start at the top of the viewport (no gap above it).
  const railStickyTop = pathname === "/" ? 0 : undefined;

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
