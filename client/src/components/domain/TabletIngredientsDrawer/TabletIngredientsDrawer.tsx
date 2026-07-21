"use client";

import { useRef, useCallback } from "react";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ChecklistOutlinedIcon from "@mui/icons-material/ChecklistOutlined";
import type { IngredientSection } from "@/types/domain";
import type { CookingModeIngredientProps } from "@/features/cooking-mode";
import IngredientSectionList from "../IngredientSectionList";
import { TabletIngredientsDrawerStyle } from "./TabletIngredientsDrawer.style";
import { TabletIngredientsDrawerText } from "./TabletIngredientsDrawer.consts";

// Px of leftward pointer movement (into the content — the handle sits at the
// right edge) before a drag is treated as "pull open" rather than a tap.
// Mirrors the click-vs-drag distinction FeaturedCategoriesCarousel already
// uses for its own pointer-drag handling.
const DRAG_OPEN_THRESHOLD = 24;

type CookingModeBase = Omit<CookingModeIngredientProps, "sectionIndex">;

type Props = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  ingredientSections: IngredientSection[];
  count: number;
  cookingMode?: CookingModeBase;
};

/**
 * Tablet (sm–md) ingredients surface — a persistent, collapsed-by-default
 * drawer anchored to the right edge, extending the same mobile-vs-desktop
 * pattern StickyIngredientsSidebar already owns rather than replacing it.
 *
 * The always-visible handle is a separate fixed element (not part of the
 * drawer paper) so the collapsed state stays trivially simple — no attempt
 * to make the sliding paper itself "peek." It sits above the paper in
 * z-index so it reads as a tab the panel slides out from behind, in both
 * the open and closed state.
 *
 * Non-modal: SwipeableDrawer's backdrop is fully removed AND scroll-lock is
 * disabled (ModalProps.hideBackdrop + disableScrollLock) — hideBackdrop alone
 * still leaves the page unscrollable, confirmed by testing.
 *
 * Drag-to-open: `swipeAreaWidth` enables MUI's own edge-swipe detection along
 * the full right edge, but it can't fire *through* the handle specifically —
 * the handle's own zIndex (needed so it stays visible once the drawer is
 * open) sits above MUI's internal SwipeArea and captures the touch target
 * first (confirmed via a touch-event listener during testing: the target was
 * the handle, not MUI's SwipeArea). So the handle also gets its own small
 * pointer-drag detector below, modeled on FeaturedCategoriesCarousel's
 * existing PointerEvent drag-vs-click pattern, rather than fighting the
 * z-index conflict.
 */
export default function TabletIngredientsDrawer({
  open,
  onOpen,
  onClose,
  ingredientSections,
  count,
  cookingMode,
}: Props) {
  const dragStartXRef = useRef<number | null>(null);
  const openedByDragRef = useRef(false);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      // Only track drag-to-open while closed. Skipping this while already
      // open avoids a real race: a drag's trailing native `click` event
      // fires with a stale `open` closure (state hasn't re-rendered yet in
      // the same gesture), which would otherwise read as a tap and close
      // the drawer right after the drag opened it.
      if (open) return;
      dragStartXRef.current = e.clientX;
      openedByDragRef.current = false;
    },
    [open],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (dragStartXRef.current === null || openedByDragRef.current) return;
      // Handle sits at the physical right edge — dragging further INTO the
      // content (toward the left) decreases clientX.
      const dx = e.clientX - dragStartXRef.current;
      if (dx < -DRAG_OPEN_THRESHOLD) {
        openedByDragRef.current = true;
        onOpen();
      }
    },
    [onOpen],
  );

  const handlePointerEnd = useCallback(() => {
    dragStartXRef.current = null;
  }, []);

  const handleToggleClick = useCallback(() => {
    if (open) onClose();
    else onOpen();
  }, [open, onOpen, onClose]);

  return (
    <>
      {/* Always-visible handle — the entire "collapsed" (and, since it stays
          visible, "open") affordance. A tap toggles open/closed; dragging
          left while closed also opens it (pointer events below). */}
      <Box
        role="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={open ? TabletIngredientsDrawerText.closeAriaLabel : TabletIngredientsDrawerText.openAriaLabel}
        onClick={handleToggleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        sx={TabletIngredientsDrawerStyle.handle}
      >
        <ChecklistOutlinedIcon sx={TabletIngredientsDrawerStyle.handleIcon} />
        <Typography sx={TabletIngredientsDrawerStyle.handleLabel}>
          {TabletIngredientsDrawerText.sectionTitle}
        </Typography>
      </Box>

      <SwipeableDrawer
        anchor="right"
        open={open}
        onOpen={onOpen}
        onClose={onClose}
        swipeAreaWidth={TabletIngredientsDrawerStyle.SWIPE_AREA_WIDTH}
        // hideBackdrop alone only removes the dimming overlay — MUI's Modal
        // still locks body scroll independently of the backdrop unless told
        // not to (confirmed via testing: the page didn't scroll with just
        // hideBackdrop). disableScrollLock is required for genuine non-modal
        // behavior, matching the "content behind stays scrollable" requirement.
        ModalProps={{ hideBackdrop: true, disableScrollLock: true, keepMounted: true }}
        transitionDuration={{ enter: 320, exit: 260 }}
        slotProps={{
          paper: { sx: TabletIngredientsDrawerStyle.paper },
          transition: { easing: TabletIngredientsDrawerStyle.springEasing },
        }}
      >
        <Box sx={TabletIngredientsDrawerStyle.header}>
          <Typography sx={TabletIngredientsDrawerStyle.headerTitle}>
            {TabletIngredientsDrawerText.sectionTitle}
            {count > 0 && (
              <Box component="span" sx={TabletIngredientsDrawerStyle.count}>
                {` · ${count}`}
              </Box>
            )}
          </Typography>
        </Box>

        <Box sx={TabletIngredientsDrawerStyle.content}>
          <IngredientSectionList
            sections={ingredientSections}
            cookingMode={
              cookingMode
                ? {
                    isActive: cookingMode.isActive,
                    checkedKeys: cookingMode.checkedKeys,
                    onToggle: cookingMode.onToggle,
                  }
                : undefined
            }
          />
        </Box>
      </SwipeableDrawer>
    </>
  );
}
