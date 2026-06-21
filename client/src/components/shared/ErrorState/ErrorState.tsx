"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";
import AppButton from "../AppButton";
import { ErrorStateStyle } from "./styles/ErrorStateStyle";

type Props = {
  title?: string;
  description?: string;
  onRetry?: () => void;
  sx?: SxProps<Theme>;
};

export default function ErrorState({
  title = "משהו השתבש",
  description,
  onRetry,
  sx,
}: Props) {
  return (
    <Box role="alert" sx={{ ...ErrorStateStyle.root, ...sx }}>
      <Typography variant="h6" color="error">
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={ErrorStateStyle.description}>
          {description}
        </Typography>
      )}
      {onRetry && (
        <AppButton variant="outlined" onClick={onRetry} sx={ErrorStateStyle.action}>
          נסה שוב
        </AppButton>
      )}
    </Box>
  );
}
