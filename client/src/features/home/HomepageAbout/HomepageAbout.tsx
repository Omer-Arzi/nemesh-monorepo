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
 * Validates that all three required fields are present and non-empty.
 * Returns null immediately if any field is missing so no partial UI is shown.
 * Delegates rendering to HomepageAboutCard (client boundary).
 */
export default function HomepageAbout({ about }: Props) {
  if (!about) return null;
  if (!about.title.trim()) return null;
  if (!hasMeaningfulBody(about.body)) return null;
  if (!about.image.url) return null;

  return (
    <Box component="section" aria-label={about.title} sx={HomepageAboutStyle.section}>
      <PageContainer>
        <HomepageAboutCard title={about.title} body={about.body} image={about.image} />
      </PageContainer>
    </Box>
  );
}
