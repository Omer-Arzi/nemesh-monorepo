import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import BlenderOutlinedIcon from "@mui/icons-material/BlenderOutlined";
import type { SxProps, Theme } from "@mui/material/styles";
import type { SpecialEquipmentItem } from "@/types/domain";
import { RecipeSpecialEquipmentSectionStyle } from "./styles/RecipeSpecialEquipmentSectionStyle";

type Props = {
  equipment: SpecialEquipmentItem[];
  sx?: SxProps<Theme>;
};

export default function RecipeSpecialEquipmentSection({ equipment, sx }: Props) {
  // Defensive re-filter: recipeService already drops blank names, but this
  // section must never render an empty gap even if that guarantee changes.
  const items = equipment
    .map((item) => item.name?.trim())
    .filter((name): name is string => !!name);

  if (items.length === 0) return null;

  return (
    <Box
      component="section"
      sx={[
        RecipeSpecialEquipmentSectionStyle.root,
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box sx={RecipeSpecialEquipmentSectionStyle.titleRow}>
        <BlenderOutlinedIcon sx={RecipeSpecialEquipmentSectionStyle.titleIcon} />
        <Typography sx={RecipeSpecialEquipmentSectionStyle.title}>כלים מיוחדים</Typography>
      </Box>

      <Box sx={RecipeSpecialEquipmentSectionStyle.chipsRow}>
        {items.map((name, index) => (
          <Chip
            key={index}
            label={name}
            variant="outlined"
            size="small"
            sx={RecipeSpecialEquipmentSectionStyle.chip}
          />
        ))}
      </Box>
    </Box>
  );
}
