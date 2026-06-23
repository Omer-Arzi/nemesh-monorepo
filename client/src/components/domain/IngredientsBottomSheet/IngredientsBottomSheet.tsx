"use client";

import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import type { IngredientSection } from "@/types/domain";
import IngredientSectionList from "../IngredientSectionList";
import { IngredientsBottomSheetStyle } from "./IngredientsBottomSheet.style";

type Props = {
  open: boolean;
  onClose: () => void;
  ingredientSections: IngredientSection[];
  count: number;
};

export default function IngredientsBottomSheet({
  open,
  onClose,
  ingredientSections,
  count,
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
        <Typography sx={IngredientsBottomSheetStyle.headerTitle}>
          מצרכים
          {count > 0 && (
            <Box component="span" sx={IngredientsBottomSheetStyle.count}>
              {` · ${count}`}
            </Box>
          )}
        </Typography>
        <IconButton onClick={onClose} size="small" aria-label="סגור רשימת מצרכים">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Scrollable ingredients */}
      <Box sx={IngredientsBottomSheetStyle.content}>
        <IngredientSectionList sections={ingredientSections} />
      </Box>
    </SwipeableDrawer>
  );
}
