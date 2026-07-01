"use client";

import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import type { IngredientSection } from "@/types/domain";
import type { CookingModeIngredientProps } from "@/features/cooking-mode";
import IngredientSectionList from "../IngredientSectionList";
import { IngredientsBottomSheetStyle } from "./IngredientsBottomSheet.style";
import { IngredientsBottomSheetText } from "./IngredientsBottomSheet.consts";

type CookingModeBase = Omit<CookingModeIngredientProps, "sectionIndex">;

type Props = {
  open: boolean;
  onClose: () => void;
  ingredientSections: IngredientSection[];
  count: number;
  cookingMode?: CookingModeBase;
};

export default function IngredientsBottomSheet({
  open,
  onClose,
  ingredientSections,
  count,
  cookingMode,
}: Props) {
  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onOpen={() => {}}
      onClose={onClose}
      disableSwipeToOpen
      slotProps={{ paper: { sx: IngredientsBottomSheetStyle.paper } }}
    >
      {/* Drag handle — visual affordance for swipe-to-dismiss */}
      <Box sx={IngredientsBottomSheetStyle.handle} />

      {/* Sheet header */}
      <Box sx={IngredientsBottomSheetStyle.header}>
        <Box sx={IngredientsBottomSheetStyle.headerStart}>
          <Typography sx={IngredientsBottomSheetStyle.headerTitle}>
            {IngredientsBottomSheetText.sectionTitle}
            {count > 0 && (
              <Box component="span" sx={IngredientsBottomSheetStyle.count}>
                {` · ${count}`}
              </Box>
            )}
          </Typography>
        </Box>

        <Box sx={IngredientsBottomSheetStyle.headerEnd}>
          <IconButton onClick={onClose} size="small" aria-label={IngredientsBottomSheetText.closeAriaLabel}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Scrollable ingredients */}
      <Box sx={IngredientsBottomSheetStyle.content}>
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
  );
}
