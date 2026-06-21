import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import type { SxProps, Theme } from "@mui/material/styles";
import { DIFFICULTY_LABEL } from "@/lib/i18n/labels";
import type { Difficulty } from "@/types/domain";
import { RecipeMetaStyle } from "./styles/RecipeMetaStyle";

type Props = {
  prepTime?: number | null;
  servings?: number | null;
  difficulty?: Difficulty | null;
  sx?: SxProps<Theme>;
};

type StatItemProps = {
  icon: React.ReactNode;
  label: string;
};

function StatItem({ icon, label }: StatItemProps) {
  return (
    <Box sx={RecipeMetaStyle.statItem}>
      <Box sx={RecipeMetaStyle.statIcon}>{icon}</Box>
      <Typography variant="body2" color="text.secondary" sx={RecipeMetaStyle.statText}>
        {label}
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
        <StatItem icon={<AccessTimeIcon fontSize="inherit" />} label={`${prepTime} דק'`} />
      )}
      {servings != null && (
        <StatItem icon={<PeopleIcon fontSize="inherit" />} label={`${servings} מנות`} />
      )}
      {difficulty != null && (
        <StatItem
          icon={<WhatshotIcon fontSize="inherit" />}
          label={DIFFICULTY_LABEL[difficulty]}
        />
      )}
    </Box>
  );
}
