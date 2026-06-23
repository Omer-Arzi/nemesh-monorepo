"use client";

import { useRef, useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import type { SxProps, Theme } from "@mui/material/styles";
import type { IngredientSection } from "@/types/domain";
import IngredientSectionList from "../IngredientSectionList";
import IngredientsBottomSheet from "../IngredientsBottomSheet";
import { StickyIngredientsSidebarStyle } from "./styles/StickyIngredientsSidebarStyle";

type Props = {
  ingredientSections?: IngredientSection[];
  sx?: SxProps<Theme>;
};

function totalIngredientCount(ingredientSections: IngredientSection[] | undefined): number {
  return ingredientSections?.reduce((n, s) => n + s.ingredients.length, 0) ?? 0;
}

/**
 * Ingredients panel for the recipe detail sidebar.
 *
 * Mobile (xs/sm):
 *   - Inline trigger card near the top of the recipe opens a Bottom Sheet.
 *   - When the inline trigger scrolls off the top of the viewport a sticky
 *     floating bottom bar appears, giving persistent access to ingredients
 *     while the user reads the preparation steps.
 *   - Both surfaces share a single `sheetOpen` state — no duplicate rendering.
 *
 * Desktop (md+): sticky scrollable panel — unchanged.
 *
 * Both mobile and desktop UIs are always in the DOM; CSS `display` controls
 * which is visible. This avoids useMediaQuery and SSR hydration issues.
 */
export default function StickyIngredientsSidebar({ ingredientSections, sx }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [fadeOpacity, setFadeOpacity] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  const count = totalIngredientCount(ingredientSections);

  // Desktop: bottom fade on the scrollable ingredient list.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const FADE_OUT_ZONE = 80;

    const check = () => {
      const hasOverflow = el.scrollHeight > el.clientHeight;
      if (!hasOverflow) { setFadeOpacity(0); return; }
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      setFadeOpacity(Math.min(1, distanceFromBottom / FADE_OUT_ZONE));
    };

    check();
    el.addEventListener("scroll", check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", check);
      ro.disconnect();
    };
  }, [ingredientSections]);

  // Mobile: show the sticky bottom bar only when the inline trigger has scrolled
  // ABOVE the viewport (the user passed it going down). If the trigger is below
  // the fold — i.e. the user hasn't reached it yet — top >= 0 so the bar stays
  // hidden. The bar hides again when the user scrolls back up and the trigger
  // re-enters the viewport.
  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Collapse the bar while the sheet is open so it doesn't sit on top of the
  // drawer overlay. It reappears automatically once the sheet closes (if the
  // inline trigger is still off screen).
  const isStickyVisible = showStickyBar && !sheetOpen;

  return (
    <>
      {/* ── Mobile: inline trigger + Bottom Sheet (xs / sm only) ── */}
      <Box sx={{ display: { xs: "block", md: "none" } }}>
        <Box
          ref={triggerRef}
          role="button"
          aria-haspopup="dialog"
          onClick={() => setSheetOpen(true)}
          sx={StickyIngredientsSidebarStyle.mobileTrigger}
        >
          <Box>
            <Typography sx={StickyIngredientsSidebarStyle.mobileTriggerTitle}>
              מצרכים
              {count > 0 && (
                <Box component="span" sx={StickyIngredientsSidebarStyle.count}>
                  {` · ${count}`}
                </Box>
              )}
            </Typography>
            <Typography sx={StickyIngredientsSidebarStyle.mobileTriggerHint}>
              לחצו לצפייה
            </Typography>
          </Box>
          <ChevronLeftIcon sx={StickyIngredientsSidebarStyle.mobileTriggerArrow} />
        </Box>

        {/* Single Bottom Sheet shared by both triggers */}
        <IngredientsBottomSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          ingredientSections={ingredientSections ?? []}
          count={count}
        />
      </Box>

      {/* ── Desktop: existing sticky panel (md+ only) ───────────── */}
      <Box sx={{ ...StickyIngredientsSidebarStyle.outer, display: { xs: "none", md: "block" }, ...sx }}>
        <Box sx={StickyIngredientsSidebarStyle.stickyPanel}>
          <Box ref={scrollRef} sx={StickyIngredientsSidebarStyle.scrollArea}>
            <Box sx={StickyIngredientsSidebarStyle.header}>
              <Typography variant="subtitle2" sx={StickyIngredientsSidebarStyle.headerTitle}>
                מצרכים
                {count > 0 && (
                  <Box component="span" sx={StickyIngredientsSidebarStyle.count}>
                    {` · ${count}`}
                  </Box>
                )}
              </Typography>
            </Box>
            <IngredientSectionList sections={ingredientSections ?? []} />
          </Box>

          {fadeOpacity > 0 && (
            <Box sx={StickyIngredientsSidebarStyle.scrollFade} style={{ opacity: fadeOpacity }} />
          )}
        </Box>
      </Box>

      {/* ── Mobile sticky bottom bar (xs / sm only) ─────────────── */}
      {/* position:fixed escapes the grid cell and pins to the viewport bottom.
          display:{xs:"flex",md:"none"} hides it on desktop via CSS — the JS
          showStickyBar state is irrelevant on desktop even if it were true.
          opacity/transform/pointerEvents are applied via inline style because
          they are runtime values that change on every scroll event; keeping them
          out of sx avoids re-generating Emotion class names on each render.
          paddingBottom uses env(safe-area-inset-bottom) via inline style to
          avoid the TypeScript literal-type limitation in MUI's sx padding prop. */}
      <Box
        sx={StickyIngredientsSidebarStyle.stickyBar}
        style={{
          opacity: isStickyVisible ? 1 : 0,
          transform: isStickyVisible ? "translateY(0)" : "translateY(100%)",
          pointerEvents: isStickyVisible ? "auto" : "none",
          paddingBottom: "env(safe-area-inset-bottom, 8px)",
        }}
      >
        <Box
          role="button"
          aria-haspopup="dialog"
          aria-label="פתח רשימת מצרכים"
          onClick={() => setSheetOpen(true)}
          sx={StickyIngredientsSidebarStyle.stickyBarInner}
        >
          <Box>
            <Typography sx={StickyIngredientsSidebarStyle.stickyBarTitle}>
              מצרכים
              {count > 0 && (
                <Box component="span" sx={StickyIngredientsSidebarStyle.count}>
                  {` · ${count}`}
                </Box>
              )}
            </Typography>
            <Typography sx={StickyIngredientsSidebarStyle.stickyBarHint}>
              לחצו לצפייה
            </Typography>
          </Box>
          <KeyboardArrowUpIcon sx={StickyIngredientsSidebarStyle.stickyBarIcon} />
        </Box>
      </Box>
    </>
  );
}
