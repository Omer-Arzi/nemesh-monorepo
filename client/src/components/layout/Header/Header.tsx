"use client";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import NextLink from "next/link";
import { useCallback, useState } from "react";
import { ROUTES } from "@/constants";
import { NAV_ITEMS, RAIL_NAV_ITEMS } from "../navConfig";
import NavDrawer from "../NavDrawer";
import NavLink from "../NavLink";
import { HeaderStyle } from "./styles/HeaderStyle";

/**
 * Site-wide sticky header.
 *
 * Layout regions:
 *  - Left:   Site identity (wordmark placeholder) — TODO: replace with logo
 *  - Centre: Desktop navigation links (hidden on mobile)
 *  - Right:  Mobile hamburger trigger (hidden on desktop)
 *
 * Responsive behaviour:
 *  - ≥ md:  Horizontal nav links visible; hamburger hidden
 *  - < md:  Nav links hidden; hamburger opens NavDrawer from the right
 *
 * Uses position="sticky" so the header scrolls with the page until it
 * reaches the top, then stays fixed — no body padding-top required.
 */
export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Stable references so NavDrawer's dependency array stays clean.
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <>
      <AppBar
        component="header"
        position="sticky"
        color="inherit"
        elevation={0}
        sx={HeaderStyle.appBar}
      >
        <Toolbar sx={HeaderStyle.toolbar}>
          {/* ── Site identity ─────────────────────────────────── */}
          {/* TODO: Replace wordmark with SVG logo once branding is finalised */}
          <Box component={NextLink} href={ROUTES.HOME} sx={HeaderStyle.wordmark}>
            <Typography variant="h6" sx={HeaderStyle.wordmarkText}>
              Nemesh
            </Typography>
          </Box>

          {/* ── Desktop navigation ────────────────────────────── */}
          <Box component="nav" aria-label="Main navigation" sx={HeaderStyle.desktopNav}>
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.href} href={item.href}>
                {item.label}
              </NavLink>
            ))}
          </Box>

          {/* Spacer pushes hamburger to the right on mobile */}
          <Box sx={HeaderStyle.spacer} />

          {/* ── Mobile menu trigger ───────────────────────────── */}
          <IconButton
            aria-label="Open navigation menu"
            aria-expanded={drawerOpen}
            aria-controls="mobile-nav-drawer"
            onClick={openDrawer}
            sx={HeaderStyle.hamburger}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile drawer — rendered outside AppBar so it overlays the page */}
      <NavDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        items={RAIL_NAV_ITEMS}
      />
    </>
  );
}
