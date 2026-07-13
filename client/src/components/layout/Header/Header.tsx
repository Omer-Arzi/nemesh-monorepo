"use client";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import MenuIcon from "@mui/icons-material/Menu";
import NextLink from "next/link";
import { useCallback, useState } from "react";
import { ROUTES } from "@/constants";
import { RAIL_NAV_ITEMS } from "../navConfig";
import NavDrawer from "../NavDrawer";
import { HeaderStyle } from "./styles/HeaderStyle";
import { SiteLogo } from "@/components/shared";

/**
 * Mobile-only site header (visible below md breakpoint).
 *
 * Layout:
 *   - sideStart (physical right in RTL): hamburger — opens the mobile NavDrawer
 *   - sideEnd   (physical left  in RTL): mobile logo
 *
 * Desktop navigation is handled by the persistent DesktopCompactHeader in
 * AppShell (logo + search) and the NavigationRail sidebar.
 */
export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <>
      <AppBar
        component="header"
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{
          ...HeaderStyle.appBar(false),
          // Desktop navigation is provided by DesktopCompactHeader — hide AppBar there.
          display: { md: "none" },
        }}
      >
        <Toolbar sx={HeaderStyle.toolbar} disableGutters>

          {/* ── sideStart: physical right in RTL ── */}
          <Box sx={HeaderStyle.sideStart}>
            <IconButton
              aria-label="Open navigation menu"
              aria-expanded={drawerOpen}
              aria-controls="mobile-nav-drawer"
              onClick={openDrawer}
              sx={HeaderStyle.hamburger}
            >
              <MenuIcon />
            </IconButton>
          </Box>

          {/* ── sideEnd: physical left in RTL ── */}
          <Box sx={HeaderStyle.sideEnd}>
            <Box
              component={NextLink}
              href={ROUTES.HOME}
              aria-label="Nemesh — דף הבית"
              sx={HeaderStyle.mobileLogoLink}
            >
              <SiteLogo variant="mobile" alt="" sx={HeaderStyle.mobileLogo} />
            </Box>
          </Box>

        </Toolbar>
      </AppBar>

      <NavDrawer open={drawerOpen} onClose={closeDrawer} items={RAIL_NAV_ITEMS} />
    </>
  );
}
