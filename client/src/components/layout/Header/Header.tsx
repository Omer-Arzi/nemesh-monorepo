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
import { useScrolled } from "@/hooks/useScrolled";
import { HeaderStyle, HEADER } from "./styles/HeaderStyle";
import useMediaQuery from "@mui/material/useMediaQuery";
import theme from "@/lib/theme/theme";

// TODO: Replace with a dedicated mobile logo once /public/images/branding/logo-mobile.svg exists.
// The mobile logo should be optimised for ~36px height (icon-only or compact wordmark).
// Until then the full desktop logo is used as a size-appropriate placeholder.
const MOBILE_LOGO_SRC = "/images/branding/logo-mobile.svg";
const DESKTOP_LOGO_SRC = "/images/branding/logo.svg";

/**
 * Site-wide sticky header.
 *
 * Desktop layout (md+):
 *   Two flex side-slots (sideStart + sideEnd, each flex:1) fill the toolbar.
 *   An absolute-positioned center layer sits on top, with left:0 + right:0 +
 *   justify-content:center.  This guarantees the logo is at exactly 50% of the
 *   AppBar (= 50% of the viewport) regardless of sidebar open/closed state or
 *   any future asymmetric side controls.
 *
 * Mobile layout (xs–sm):
 *   - sideStart (physical right in RTL): hamburger trigger
 *   - sideEnd (physical left in RTL): mobile logo (not centered)
 *   - Absolute logo layer hidden
 *   - Header height is fixed (no scroll shrinking on mobile)
 *
 * Scroll behaviour (desktop only):
 *   - scrollY ≤ 32px: 96px header, 78px logo
 *   - scrollY > 32px: 64px header, 50px logo
 *   Transitions: 250ms ease-out; disabled for prefers-reduced-motion.
 */
export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const compact = useScrolled(HEADER.SCROLL_THRESHOLD);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  // const chosenLogo = isMobile ? MOBILE_LOGO_SRC : DESKTOP_LOGO_SRC;
  const chosenLogo = DESKTOP_LOGO_SRC;
  

  return (
    <>
      <AppBar
        component="header"
        position="sticky"
        color="inherit"
        elevation={0}
        sx={HeaderStyle.appBar(compact)}
      >
        <Toolbar sx={HeaderStyle.toolbar} disableGutters>

          {/* ── sideStart: physical right in RTL ── */}
          <Box sx={HeaderStyle.sideStart}>
            {/* Mobile: hamburger trigger */}
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
            {/* Mobile: logo (left side, not centered) */}
            <Box
              component={NextLink}
              href={ROUTES.HOME}
              aria-label="Nemesh — דף הבית"
              sx={HeaderStyle.mobileLogoLink}
            >
              <Box
                component="img"
                src={chosenLogo}
                alt=""
                sx={HeaderStyle.mobileLogo}
              />
            </Box>
          </Box>

          {/* ── Absolute center layer: desktop logo only ── */}
          {/* hidden on mobile via display:{xs:'none', md:'flex'} */}
          <Box sx={HeaderStyle.logoCenter}>
            <Box
              component={NextLink}
              href={ROUTES.HOME}
              aria-label="Nemesh — דף הבית"
              sx={HeaderStyle.logoLink}
            >
              <Box
                component="img"
                src="/images/branding/logo.svg"
                alt=""
                sx={HeaderStyle.logo(compact)}
              />
            </Box>
          </Box>

        </Toolbar>
      </AppBar>

      <NavDrawer open={drawerOpen} onClose={closeDrawer} items={RAIL_NAV_ITEMS} />
    </>
  );
}
