import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";
import type { RecipeIngredient } from "@/types/domain";
import IngredientList from "../IngredientList";
import { StickyIngredientsSidebarStyle } from "./styles/StickyIngredientsSidebarStyle";

type Props = {
  ingredients: RecipeIngredient[];
  servings?: number | null;
  sx?: SxProps<Theme>;
};

/**
 * Sticky ingredients panel for the recipe detail sidebar.
 *
 * On desktop: the inner container sticks below the AppBar and scrolls
 * internally when the ingredient list overflows the viewport height.
 * On mobile: renders as a normal block — no sticky, no max-height.
 *
 * Use inside <RecipeDetailLayout sidebar={<StickyIngredientsSidebar />} />.
 */
export default function StickyIngredientsSidebar({
  ingredients,
  servings,
  sx,
}: Props) {
  return (
    <Box sx={{ ...StickyIngredientsSidebarStyle.outer, ...sx }}>
      <Box sx={StickyIngredientsSidebarStyle.stickyInner}>
        {/* ── Panel header ─────────────────────────────────────── */}
        <Box sx={StickyIngredientsSidebarStyle.header}>
          <Typography variant="subtitle2" sx={StickyIngredientsSidebarStyle.headerTitle}>
            מצרכים
          </Typography>

          {servings != null && (
            <Typography variant="body2" color="text.secondary">
              {`${servings} מנות`}
            </Typography>
          )}
        </Box>

        {/* ── Ingredient list ───────────────────────────────────── */}
        <IngredientList ingredients={ingredients} />
      </Box>
    </Box>
  );
}
