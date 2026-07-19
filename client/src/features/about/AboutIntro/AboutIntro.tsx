import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { BlockRenderer } from "@/components/shared";
import type { AboutPage } from "@/types/domain";
import AboutPhotoRail from "../AboutPhotoRail";
import { AboutIntroStyle } from "./AboutIntro.style";

type Props = {
  about: AboutPage;
};

// Same generic fallback HomepageAbout already uses for its (also optional)
// title, kept intentionally independent of eyebrow — the page must always
// render exactly one H1, even when no title has been entered yet.
const DEFAULT_HEADING = "אודות";

/**
 * About page intro composition — a single continuous editorial rich-text
 * body (via the shared BlockRenderer, same as content-pages) beside the
 * photo rail. No section cards or CTAs — see docs/architecture.md.
 *
 * All content is Strapi-managed (about-page single type); this component
 * only lays it out. eyebrow and title are both optional and handled
 * independently: eyebrow is omitted cleanly when absent, title falls back
 * to DEFAULT_HEADING so the page's single H1 is never missing.
 */
export default function AboutIntro({ about }: Props) {
  return (
    <Box sx={AboutIntroStyle.root}>
      <Box sx={AboutIntroStyle.textColumn}>
        {about.eyebrow && (
          <>
            <Typography component="p" sx={AboutIntroStyle.eyebrow}>
              {about.eyebrow}
            </Typography>
            <Box sx={AboutIntroStyle.accent} aria-hidden />
          </>
        )}

        <Typography variant="h4" component="h1" sx={AboutIntroStyle.heading}>
          {about.title ?? about.title}
        </Typography>

        <BlockRenderer blocks={about.content} />
      </Box>

      <Box sx={AboutIntroStyle.railColumn}>
        <AboutPhotoRail primaryImage={about.primaryImage} secondaryImage={about.secondaryImage} />
      </Box>
    </Box>
  );
}
