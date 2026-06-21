"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";
import { EmptyStateStyle } from "./styles/EmptyStateStyle";

type Props = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  sx?: SxProps<Theme>;
};

export default function EmptyState({ title, description, icon, action, sx }: Props) {
  return (
    <Box sx={{ ...EmptyStateStyle.root, ...sx }}>
      {icon && <Box sx={EmptyStateStyle.iconWrapper}>{icon}</Box>}
      <Typography variant="h6" color="text.secondary">
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.disabled" sx={EmptyStateStyle.description}>
          {description}
        </Typography>
      )}
      {action && <Box sx={EmptyStateStyle.action}>{action}</Box>}
    </Box>
  );
}
