"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";
import { SectionHeaderStyle } from "./styles/SectionHeaderStyle";

type Props = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  sx?: SxProps<Theme>;
};

export default function SectionHeader({ title, subtitle, action, sx }: Props) {
  return (
    <Box sx={{ ...SectionHeaderStyle.root, ...sx }}>
      <Box sx={SectionHeaderStyle.titleGroup}>
        <Typography variant="h5" component="h2" sx={SectionHeaderStyle.title}>
          {title}
        </Typography>
        <Box sx={SectionHeaderStyle.accent} />
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={SectionHeaderStyle.subtitle}>
            {subtitle}
          </Typography>
        )}
      </Box>

      {action && <Box sx={SectionHeaderStyle.actionSlot}>{action}</Box>}
    </Box>
  );
}
