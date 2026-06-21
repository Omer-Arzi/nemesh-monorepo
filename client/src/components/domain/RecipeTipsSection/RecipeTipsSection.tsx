import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import type { SxProps, Theme } from "@mui/material/styles";
import type { RecipeTip } from "@/types/domain";
import { SectionHeader } from "@/components/shared";
import { RecipeTipsSectionStyle } from "./styles/RecipeTipsSectionStyle";

type Props = {
  tips: RecipeTip[];
  sx?: SxProps<Theme>;
};

export default function RecipeTipsSection({ tips, sx }: Props) {
  if (tips.length === 0) return null;

  return (
    <section>
      <SectionHeader title="טיפים" sx={sx} />

      <Box>
        {tips.map((tip, index) => (
          <Box key={index} sx={RecipeTipsSectionStyle.tipItem}>
            <TipsAndUpdatesIcon fontSize="inherit" sx={RecipeTipsSectionStyle.tipBullet} />
            <Typography variant="body1">{tip.text}</Typography>
          </Box>
        ))}
      </Box>
    </section>
  );
}
