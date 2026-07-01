"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import PlayCircleOutlinedIcon from "@mui/icons-material/PlayCircleOutlined";
import StopCircleOutlinedIcon from "@mui/icons-material/StopCircleOutlined";
import { CookingModeToolbarStyle } from "./styles/CookingModeToolbarStyle";

const text = {
  inactiveTitle: "מצב בישול",
  inactiveSubtitle: "סמנו מצרכים ושלבים תוך כדי עבודה",
  activateButton: "הפעל מצב בישול",
  activeTitle: "מצב בישול פעיל",
  deactivateButton: "כבה מצב בישול",
  resetButton: "אפס סימונים",
  ingredientLabel: (checked: number, total: number) => `${checked} מתוך ${total} מצרכים`,
  stepLabel: (checked: number, total: number) => `${checked} מתוך ${total} שלבים`,
} as const;

type Props = {
  isActive: boolean;
  onToggle: () => void;
  onReset: () => void;
  ingredientProgress: { checked: number; total: number };
  stepProgress: { checked: number; total: number };
};

export default function CookingModeToolbar({
  isActive,
  onToggle,
  onReset,
  ingredientProgress,
  stepProgress,
}: Props) {
  const hasProgress = ingredientProgress.total > 0 || stepProgress.total > 0;

  return (
    <Box sx={CookingModeToolbarStyle.root}>
      <Box sx={CookingModeToolbarStyle.textBlock}>
        <Typography sx={CookingModeToolbarStyle.title}>
          {isActive ? text.activeTitle : text.inactiveTitle}
        </Typography>
        {isActive && hasProgress ? (
          <Box sx={CookingModeToolbarStyle.chips}>
            <Chip
              label={text.ingredientLabel(ingredientProgress.checked, ingredientProgress.total)}
              size="small"
              color="success"
              variant="outlined"
              sx={CookingModeToolbarStyle.progressChip}
            />
            <Typography component="span" sx={CookingModeToolbarStyle.chipSeparator}>·</Typography>
            <Chip
              label={text.stepLabel(stepProgress.checked, stepProgress.total)}
              size="small"
              color="success"
              variant="outlined"
              sx={CookingModeToolbarStyle.progressChip}
            />
          </Box>
        ) : (
          <Typography sx={CookingModeToolbarStyle.subtitle}>
            {text.inactiveSubtitle}
          </Typography>
        )}
      </Box>

      <Box sx={CookingModeToolbarStyle.actions}>
        {isActive && (
          <Button
            size="small"
            variant="text"
            color="inherit"
            onClick={onReset}
            sx={CookingModeToolbarStyle.resetButton}
          >
            {text.resetButton}
          </Button>
        )}
        <Button
          size="small"
          variant={isActive ? "outlined" : "contained"}
          color="primary"
          startIcon={isActive ? <StopCircleOutlinedIcon /> : <PlayCircleOutlinedIcon />}
          onClick={onToggle}
          aria-pressed={isActive}
          sx={isActive ? CookingModeToolbarStyle.deactivateButton : CookingModeToolbarStyle.activateButton}
        >
          {isActive ? text.deactivateButton : text.activateButton}
        </Button>
      </Box>
    </Box>
  );
}
