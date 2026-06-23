"use client";

import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { RecipeDetailLayoutStyle } from "./styles/RecipeDetailLayoutStyle";

type Props = {
  /**
   * Content for the sidebar slot.
   * On desktop (md+) this renders as the RIGHT column (RTL: column 1).
   * On mobile it stacks above the main content.
   *
   * Typically: <StickyIngredientsSidebar />
   */
  sidebar: React.ReactNode;
  /**
   * Main recipe content — preparation steps, tips, etc.
   * On desktop (md+) this is the LEFT column (RTL: column 2, 1fr).
   */
  children: React.ReactNode;
  sx?: SxProps<Theme>;
};

/**
 * Two-column recipe detail layout.
 *
 * Desktop: sidebar (RIGHT, 300px) | main content (LEFT, 1fr).
 * Mobile:  sidebar stacks above main content (single column).
 *
 * RTL note: CSS Grid with dir="rtl" places column 1 on the visual RIGHT.
 * The sidebar is the first child, so it occupies column 1 → visual RIGHT. ✓
 * The separator border relies on stylis-plugin-rtl flipping border-right to
 * border-left, putting the line on the sidebar's inner face (facing main). ✓
 */
export default function RecipeDetailLayout({ sidebar, children, sx }: Props) {
  return (
    <Box sx={{ ...RecipeDetailLayoutStyle.grid, ...sx }}>
      {/* Sidebar — first child → column 1 → visual RIGHT in RTL */}
      <Box sx={RecipeDetailLayoutStyle.sidebarColumn}>{sidebar}</Box>

      {/* Main content — second child → column 2 → visual LEFT in RTL */}
      <Box component="main" sx={RecipeDetailLayoutStyle.mainColumn}>
        {children}
      </Box>
    </Box>
  );
}
