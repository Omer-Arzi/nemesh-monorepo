import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { Image } from "@/types/domain";
import { NemeshImage } from "@/components/shared";
import { ShirChallengeHeroStyle } from "./ShirChallengeHero.style";

type Props = {
  title: string;
  badgeText: string;
  subtitle: string;
  heroImage: Image | null;
};

export default function ShirChallengeHero({ title, badgeText, subtitle, heroImage }: Props) {
  return (
    <Box sx={ShirChallengeHeroStyle.root}>
      <NemeshImage
        image={heroImage}
        fill
        objectFit="cover"
        objectPosition="center 42%"
        sizes="(max-width: 600px) 100vw, (max-width: 960px) 100vw, 800px"
        priority
        fallback={
          <Box
            sx={{
              position: "absolute" as const,
              inset: 0,
              bgcolor: "surface.placeholder",
            }}
          />
        }
      />

      <Box sx={ShirChallengeHeroStyle.overlay}>
        <Box component="span" sx={ShirChallengeHeroStyle.badge}>
          {badgeText}
        </Box>
        <Typography variant="h3" component="h1" sx={ShirChallengeHeroStyle.title}>
          {title}
        </Typography>
        <Typography variant="body1" sx={ShirChallengeHeroStyle.subtitle}>
          {subtitle}
        </Typography>
      </Box>
    </Box>
  );
}
