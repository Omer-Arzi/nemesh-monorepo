import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { PageContainer, NemeshImage } from "@/components/shared";
import type { HomeFeatureSection } from "@/types/domain";
import FeatureSectionReadMoreLink from "./FeatureSectionReadMoreLink";
import { FeatureSectionStyle } from "./FeatureSection.style";
import { FEATURE_CARD_ILLUSTRATIONS } from "./FeatureSection.consts";

type Props = {
  section: HomeFeatureSection | null | undefined;
};

/**
 * Homepage feature-cards section — server component.
 *
 * Structural placeholder only: minimal neutral layout, no final visual
 * design. Renders nothing when the section is absent or has no valid cards
 * (the service layer already drops cards missing a title, or missing both
 * an icon and a matching coded illustration, and returns null for the
 * whole section when no cards survive that filter).
 */
export default function FeatureSection({ section }: Props) {
  if (!section || section.cards.length === 0) return null;

  const readMoreLabel = section.readMoreLabel || section.readMorePage?.title || "קרא עוד";

  return (
    <Box component="section" aria-label={section.title || "תכונות"} sx={FeatureSectionStyle.section}>
      <PageContainer>
        {section.title && (
          <Typography component="h2" variant="h5" sx={FeatureSectionStyle.title}>
            {section.title}
          </Typography>
        )}
        <Box sx={FeatureSectionStyle.cards}>
          {section.cards.map((card) => {
            const Illustration = FEATURE_CARD_ILLUSTRATIONS[card.key];
            return (
              <Box key={card.key} sx={FeatureSectionStyle.card}>
                <Box sx={FeatureSectionStyle.iconWrapper}>
                  {Illustration ? (
                    <Illustration />
                  ) : (
                    card.icon && (
                      <NemeshImage image={card.icon} alt={card.icon.alt || card.title} fill sizes="56px" />
                    )
                  )}
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
          })}
        </Box>

        {section.readMorePage && (
          <Box sx={FeatureSectionStyle.readMoreWrapper}>
            <FeatureSectionReadMoreLink href={`/${section.readMorePage.slug}`} label={readMoreLabel} />
          </Box>
        )}
      </PageContainer>
    </Box>
  );
}
