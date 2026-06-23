"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TipsAndUpdatesOutlinedIcon from "@mui/icons-material/TipsAndUpdatesOutlined";
import type { SxProps, Theme } from "@mui/material/styles";
import type { RecipeTip } from "@/types/domain";
import { RecipeTipsSectionStyle } from "./styles/RecipeTipsSectionStyle";

type Props = {
  tips: RecipeTip[];
  sx?: SxProps<Theme>;
};

export default function RecipeTipsSection({ tips, sx }: Props) {
  const [open, setOpen] = useState(false);

  if (tips.length === 0) return null;

  return (
    <Box
      component="section"
      sx={[RecipeTipsSectionStyle.root, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Box
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        sx={RecipeTipsSectionStyle.header}
      >
        <Box sx={RecipeTipsSectionStyle.titleRow}>
          <TipsAndUpdatesOutlinedIcon sx={RecipeTipsSectionStyle.titleIcon} />
          <Typography sx={RecipeTipsSectionStyle.title}>הערות מהמטבח</Typography>
        </Box>
        <ExpandMoreIcon
          sx={{
            ...RecipeTipsSectionStyle.expandIcon,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </Box>

      <Collapse in={open}>
        <Box sx={RecipeTipsSectionStyle.content}>
          {tips.map((tip, index) => (
            <Box key={index} sx={RecipeTipsSectionStyle.tipCard}>
              <Typography variant="body1">{tip.text}</Typography>
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}
