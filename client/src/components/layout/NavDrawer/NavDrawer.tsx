"use client";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "@mui/material/styles";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ROUTES } from "@/constants";
import type { RailNavItem } from "../navConfig";
import NavigationItem from "../NavigationItem";
import { useSurpriseMe } from "@/hooks/useSurpriseMe";
import { SiteLogo } from "@/components/shared";
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
 * Opens from the same physical side as the hamburger button (physical right,
 * the start side in Hebrew) — see the anchor prop comment below for why that
 * means passing "left", not "right".
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
      // In RTL the hamburger sits on the physical right, so the drawer must open
      // from the right; LTR's conventional position is the left. Counterintuitively
      // that means passing "left" here, not "right": MUI's Drawer paper is
      // positioned by the raw anchor value (it does not flip it for RTL itself —
      // only the slide-transition direction gets that treatment internally), but
      // this app's global Emotion cache (EmotionRegistry) runs stylis-plugin-rtl,
      // which flips the physical left/right CSS every Emotion-styled component
      // generates, MUI's own included. So anchor="right" ends up rendering on the
      // physical left — confirmed by measuring the rendered paper's bounding box,
      // not just by reasoning about it.
      anchor={direction === "rtl" ? "left" : "right"}
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: NavDrawerStyle.paper } }}
    >
      <Box role="navigation" aria-label="Mobile navigation" sx={NavDrawerStyle.nav}>

        {/* Branded drawer header: logo (RTL start = physical right) + close button */}
        <Box sx={NavDrawerStyle.drawerHeader}>
          <Box
            component={NextLink}
            href={ROUTES.HOME}
            aria-label="Nemesh — דף הבית"
            sx={NavDrawerStyle.logoLink}
          >
            <SiteLogo variant="mobile" alt="" sx={NavDrawerStyle.logo} />
          </Box>

          <IconButton
            onClick={onClose}
            aria-label="סגירת תפריט"
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
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
