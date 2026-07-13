import Box from "@mui/material/Box";
import { PageContainer } from "@/components/shared";
import type { HomepageAbout as HomepageAboutData, BlockNode } from "@/types/domain";
import HomepageAboutCard from "./HomepageAboutCard";
import { HomepageAboutStyle } from "./HomepageAbout.style";

type Props = {
  about: HomepageAboutData | null | undefined;
};

function hasMeaningfulBody(body: BlockNode[]): boolean {
  if (body.length === 0) return false;
  return body.some((block) => {
    if (block.type === "paragraph") {
      return block.children.some((c) => c.type === "text" && c.text.trim() !== "");
    }
    // Any non-paragraph block (heading, list, quote, image…) counts as content.
    return true;
  });
}

/**
 * Homepage About section — server component.
 *
 * Requires a meaningful body and a usable image URL.
 * The title is optional — the section renders without a heading when absent.
 * Returns null immediately if the minimum required fields are missing.
 * Delegates rendering to HomepageAboutCard (client boundary).
 */
export default function HomepageAbout({ about }: Props) {
  if (!about) return null;
  if (!hasMeaningfulBody(about.body)) return null;
  if (!about.image.url) return null;

  // Use the title as the accessible label when present; fall back to a
  // generic Hebrew label so the landmark remains descriptive for screen readers.
  const sectionLabel = about.title || "אודות";

  return (
    <Box component="section" aria-label={sectionLabel} sx={HomepageAboutStyle.section}>
      <PageContainer>
        <HomepageAboutCard title={about.title} body={about.body} image={about.image} />
      </PageContainer>
    </Box>
  );
}
