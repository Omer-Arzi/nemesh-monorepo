"use client";

import Button from "@mui/material/Button";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import type { SxProps, Theme } from "@mui/material/styles";
import { PrintRecipeButtonStyle } from "./styles/PrintRecipeButtonStyle";
import { PrintRecipeButtonText } from "./PrintRecipeButton.consts";

type Props = {
  /** Invoked when the reader activates the control (opens the print dialog). */
  onClick: () => void;
  sx?: SxProps<Theme>;
};

/**
 * On-screen control that triggers the dedicated recipe print document.
 *
 * Purely presentational: the `useReactToPrint` hook and the hidden print
 * subtree live in RecipeContent — this component only renders the affordance
 * and forwards the click.
 */
export default function PrintRecipeButton({ onClick, sx }: Props) {
  return (
    <Button
      type="button"
      variant="outlined"
      color="primary"
      size="small"
      startIcon={<PrintOutlinedIcon />}
      onClick={() => onClick()}
      sx={[PrintRecipeButtonStyle.root, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {PrintRecipeButtonText.label}
    </Button>
  );
}
