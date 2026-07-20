"use client";

import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { HomeFeatureCard } from "@/types/domain";
import { FeatureSectionStyle } from "./FeatureSection.style";

type Props = {
  card: HomeFeatureCard;
  /** Already-rendered icon content (illustration element or NemeshImage) — resolved
   * server-side in FeatureSection, since a component *reference* (unlike an already-
   * rendered element) can't cross the Server -> Client Component boundary as a prop. */
  icon: ReactNode;
};

/**
 * Split out from FeatureSection (a Server Component) into its own
 * "use client" component for the same reason as AboutReadMoreLink /
 * FeatureSectionReadMoreLink: this card's sx needs a theme-callback
 * function (for the hover color/shadow), and a plain function can't cross
 * the Server -> Client Component boundary as a prop.
 */
export default function FeatureCard({ card, icon }: Props) {
  return (
    <Box sx={FeatureSectionStyle.card}>
      <Box className="feature-card-icon" sx={FeatureSectionStyle.iconWrapper}>
        {icon}
      </Box>
      <Typography component="h3" variant="subtitle1" sx={FeatureSectionStyle.cardTitle}>
        {card.title}
      </Typography>
      {card.description && (
        <Typography component="p" variant="body2" sx={FeatureSectionStyle.cardDescription}>
          {card.description}
        </Typography>
      )}
    </Box>
  );
}
