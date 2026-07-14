"use client";

import { useEffect, useRef } from "react";
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
  /** Sticky top offset in px. Defaults to APP_HEADER_HEIGHT. Pass 0 on pages without a visible top header. */
  stickyTop?: number;
};

export default function NavigationRail({ open, onToggle, stickyTop }: Props) {
  const { handleSurpriseMe, loading: surpriseLoading } = useSurpriseMe();

  // TEMP DEBUG — layout bug investigation. Remove before commit.
  const outerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(`%c[layout-debug]%c NavigationRail render`, "color:#4caf50;font-weight:bold", "color:inherit", {
      t: Math.round(performance.now()),
      openProp: open,
      stickyTop,
    });
    const raf = requestAnimationFrame(() => {
      const el = outerRef.current;
      if (!el) return;
      const cs = getComputedStyle(el);
      // eslint-disable-next-line no-console
      console.log(`%c[layout-debug]%c NavigationRail computed (post-paint)`, "color:#4caf50;font-weight:bold", "color:inherit", {
        openProp: open,
        stickyTop,
        display: cs.display,
        position: cs.position,
        top: cs.top,
        width: cs.width,
        transform: cs.transform,
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [open, stickyTop]);

  return (
    <Box ref={outerRef} data-debug="nav-rail" sx={NavigationRailStyle.outer(open, stickyTop)}>
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
