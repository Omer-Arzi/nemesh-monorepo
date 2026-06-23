"use client";

import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CloseIcon from "@mui/icons-material/Close";
import PlayCircleOutlinedIcon from "@mui/icons-material/PlayCircleOutlined";
import type { IngredientSection } from "@/types/domain";
import type { CookingModeIngredientProps } from "@/features/cooking-mode";
import IngredientSectionList from "../IngredientSectionList";
import { IngredientsBottomSheetStyle } from "./IngredientsBottomSheet.style";

type CookingModeBase = Omit<CookingModeIngredientProps, "sectionIndex">;

type Props = {
  open: boolean;
  onClose: () => void;
  ingredientSections: IngredientSection[];
  count: number;
  cookingMode?: CookingModeBase & {
    toggleActive: () => void;
    ingredientProgress: { checked: number; total: number };
  };
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
            מצרכים
            {count > 0 && (
              <Box component="span" sx={IngredientsBottomSheetStyle.count}>
                {` · ${count}`}
              </Box>
            )}
          </Typography>
          {cookingMode?.isActive && cookingMode.ingredientProgress.total > 0 && (
            <Chip
              label={`${cookingMode.ingredientProgress.checked} מתוך ${cookingMode.ingredientProgress.total}`}
              size="small"
              color="success"
              variant="outlined"
              sx={IngredientsBottomSheetStyle.progressChip}
            />
          )}
        </Box>

        <Box sx={IngredientsBottomSheetStyle.headerEnd}>
          <Button
            size="small"
            variant={cookingMode?.isActive ? "contained" : "outlined"}
            color={cookingMode?.isActive ? "primary" : "inherit"}
            startIcon={<PlayCircleOutlinedIcon />}
            onClick={cookingMode?.toggleActive}
            sx={IngredientsBottomSheetStyle.cookingModeButton}
          >
            מצב בישול
          </Button>
          <IconButton onClick={onClose} size="small" aria-label="סגור רשימת מצרכים">
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
