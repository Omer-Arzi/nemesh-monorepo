"use client";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import type { NavItem } from "../navConfig";
import { NavDrawerStyle } from "./styles/NavDrawerStyle";

type Props = {
  open: boolean;
  onClose: () => void;
  items: readonly NavItem[];
};

/**
 * Mobile navigation drawer.
 *
 * Slides in from the end-side of the screen: right in LTR, left in RTL.
 * Closes automatically when the active route changes (e.g. after link tap or
 * browser back).
 *
 * Receives `items` from Header so the nav structure stays in one place
 * (navConfig.ts) and both surfaces stay in sync.
 */
export default function NavDrawer({ open, onClose, items }: Props) {
  const pathname = usePathname();
  const { direction } = useTheme();

  // Close when the route changes — handles link taps and browser back/forward.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onClose();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps
  // onClose is stable (useCallback in Header); pathname drives close intent.

  return (
    <Drawer
      anchor={direction === "rtl" ? "left" : "right"}
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: NavDrawerStyle.paper } }}
    >
      <Box role="navigation" aria-label="Mobile navigation" sx={NavDrawerStyle.nav}>
        {/* Drawer header label */}
        <Box sx={NavDrawerStyle.drawerHeader}>
          <Typography variant="overline" color="text.secondary">
            Menu
          </Typography>
        </Box>

        <Divider />

        <List disablePadding>
          {items.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

            return (
              <ListItem key={item.href} disablePadding>
                {/*
                 * NextLink wraps the button so the anchor is in the DOM
                 * for right-click / open-in-new-tab, while ListItemButton
                 * handles the visual feedback.
                 */}
                <NextLink
                  href={item.href}
                  style={{
                    width: "100%",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <ListItemButton selected={isActive} sx={NavDrawerStyle.listItemButton}>
                    <ListItemText
                      primary={item.label}
                      slotProps={{
                        primary: { sx: NavDrawerStyle.listItemText(isActive) },
                      }}
                    />
                  </ListItemButton>
                </NextLink>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
}
