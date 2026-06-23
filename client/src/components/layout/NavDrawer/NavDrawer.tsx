"use client";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import type { RailNavItem } from "../navConfig";
import NavigationItem from "../NavigationItem";
import { useSurpriseMe } from "@/hooks/useSurpriseMe";
import { NavDrawerStyle } from "./styles/NavDrawerStyle";

type Props = {
  open: boolean;
  onClose: () => void;
  items: readonly RailNavItem[];
};

/**
 * Mobile navigation drawer.
 *
 * Renders the same RAIL_NAV_ITEMS as the desktop NavigationRail — icons,
 * active states, and the "תפתיע אותי" surprise-me action are all included.
 *
 * Anchor: "right" in RTL so the drawer opens from the same physical side as
 * the hamburger button (physical right = start side in Hebrew).
 *
 * Closes automatically when the active route changes.
 */
export default function NavDrawer({ open, onClose, items }: Props) {
  const pathname = usePathname();
  const { direction } = useTheme();
  const { handleSurpriseMe, loading: surpriseLoading } = useSurpriseMe();

  // Close when the route changes — handles link taps and browser back/forward.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onClose();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Drawer
      // In RTL the hamburger sits on the physical right, so the drawer opens from
      // the right. In LTR the conventional position is the left.
      anchor={direction === "rtl" ? "right" : "left"}
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: NavDrawerStyle.paper } }}
    >
      <Box role="navigation" aria-label="Mobile navigation" sx={NavDrawerStyle.nav}>
        <Box sx={NavDrawerStyle.drawerHeader}>
          <Typography variant="overline" color="text.secondary">
            תפריט
          </Typography>
        </Box>

        <Divider />

        <Box sx={NavDrawerStyle.navContent}>
          <List disablePadding>
            {items.map((item) => (
              <ListItem key={item.href + item.label} disablePadding>
                <NavigationItem
                  label={item.label}
                  href={item.href}
                  icon={item.icon}
                  railOpen={true}
                  neverActive={item.neverActive}
                  {...(item.action === "surprise-me" && {
                    onClick: handleSurpriseMe,
                    loading: surpriseLoading,
                  })}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </Drawer>
  );
}
