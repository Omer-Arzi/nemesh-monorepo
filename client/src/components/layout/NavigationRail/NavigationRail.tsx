"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { RAIL_NAV_ITEMS } from "../navConfig";
import NavigationItem from "../NavigationItem";
import { useSurpriseMe } from "@/hooks/useSurpriseMe";
import { NavigationRailStyle } from "./NavigationRail.style";

type Props = {
  open: boolean;
  onToggle: () => void;
};

export default function NavigationRail({ open, onToggle }: Props) {
  const { handleSurpriseMe, loading: surpriseLoading } = useSurpriseMe();

  return (
    <Box sx={NavigationRailStyle.outer(open)}>
      {/* Visual panel surface: background, border, shadow, clips nav content */}
      <Box sx={(theme) => NavigationRailStyle.panel(theme)}>
        {/* Always RAIL_WIDTH wide — panel clips it from the left as it collapses */}
        <Box sx={NavigationRailStyle.navContent}>
          <Box component="nav" sx={NavigationRailStyle.nav}>
            {RAIL_NAV_ITEMS.map((item) => (
              <NavigationItem 
                key={item.href + item.label}
                label={item.label}
                href={item.href}
                icon={item.icon}
                railOpen={open}
                neverActive={item.neverActive}
                {...(item.action === "surprise-me" && {
                  onClick: handleSurpriseMe,
                  loading: surpriseLoading,
                })}
              />
            ))}
          </Box>
        </Box>
      </Box>

      {/* Toggle: absolute on outer (overflow:visible), straddles the panel edge */}
      <IconButton
        onClick={onToggle}
        aria-label={open ? "סגור תפריט ניווט" : "פתח תפריט ניווט"}
        size="small"
        sx={NavigationRailStyle.toggle}
      >
        {open ? <ChevronRightIcon /> : <ChevronLeftIcon  />}
      </IconButton>
    </Box>
  );
}
