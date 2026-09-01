import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import type { SxProps, Theme } from "@mui/material/styles";
import { DIFFICULTY_LABEL } from "@/lib/i18n/labels";
import { formatPrepTime } from "@/lib/formatters/prepTime";
import type { Difficulty } from "@/types/domain";
import { RecipeMetaText } from "./RecipeMeta.consts";
import { RecipeMetaStyle } from "./styles/RecipeMetaStyle";

type Props = {
  /** Active work time — the only time value recipe cards ever show. `totalTime` is a
   * full-recipe-page-only detail (see RecipeHero) and is intentionally not a prop here. */
  prepTime?: number | null;
  servings?: number | null;
  difficulty?: Difficulty | null;
  sx?: SxProps<Theme>;
};

type StatItemProps = {
  icon: React.ReactNode;
  value: string;
};

function StatItem({ icon, value }: StatItemProps) {
  return (
    <Box sx={RecipeMetaStyle.statItem}>
      <Box sx={RecipeMetaStyle.statIcon} aria-hidden="true">
        {icon}
      </Box>
      <Typography variant="body2" color="text.secondary" sx={RecipeMetaStyle.statText}>
        {value}
      </Typography>
    </Box>
  );
}

export default function RecipeMeta({ prepTime, servings, difficulty, sx }: Props) {
  const hasAny = prepTime != null || servings != null || difficulty != null;
  if (!hasAny) return null;

  return (
    <Box sx={{ ...RecipeMetaStyle.root, ...sx }}>
      {prepTime != null && (
        <StatItem
          icon={<AccessTimeIcon fontSize="inherit" />}
          value={`${formatPrepTime(prepTime)} ${RecipeMetaText.workTimeSuffix}`}
        />
      )}
      {servings != null && (
        <StatItem icon={<PeopleIcon fontSize="inherit" />} value={`${servings} ${RecipeMetaText.servingsUnit}`} />
      )}
      {difficulty != null && (
        <StatItem icon={<WhatshotIcon fontSize="inherit" />} value={DIFFICULTY_LABEL[difficulty]} />
      )}
    </Box>
  );
}
