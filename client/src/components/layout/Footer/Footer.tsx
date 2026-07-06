"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import MuiLink from "@mui/material/Link";
import NextLink from "next/link";
import { FreckleDust } from "@/components/shared";
import { useFooter, useFooterPages } from "@/features/page/hooks";
import type { Page } from "@/types/domain";
import { FooterStyle } from "./styles/FooterStyle";

type FooterPageSection = { title: string; pages: Page[] };

function buildSections(pages: Page[]): FooterPageSection[] {
  const map = new Map<string, Page[]>();
  for (const page of pages) {
    const key = page.footerSection ?? "";
    const group = map.get(key) ?? [];
    group.push(page);
    map.set(key, group);
  }
  return Array.from(map.entries()).map(([title, pages]) => ({ title, pages }));
}

export default function Footer() {
  const { data: footer } = useFooter();
  const { data: footerPages = [] } = useFooterPages();
  const year = new Date().getFullYear();

  const sections = buildSections(footerPages);
  const hasSections = sections.length > 0;

  return (
    <Box component="footer" sx={FooterStyle.root}>
      <FreckleDust placement="top-right" density="low" />
      <Container maxWidth="lg">
        {hasSections && (
          <Grid container spacing={4} sx={FooterStyle.sections}>
            {sections.map((section, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                {section.title && (
                  <Typography variant="subtitle2" sx={FooterStyle.sectionTitle}>
                    {section.title}
                  </Typography>
                )}
                <Box component="ul" sx={FooterStyle.linkList}>
                  {section.pages.map((page, j) => (
                    <Box key={j} component="li" sx={FooterStyle.linkItem}>
                      <MuiLink component={NextLink} href={`/${page.slug}`} sx={FooterStyle.link}>
                        {page.title}
                      </MuiLink>
                    </Box>
                  ))}
                </Box>
              </Grid>
            ))}
          </Grid>
        )}

        <Box sx={hasSections ? FooterStyle.bottomWithDivider : FooterStyle.bottom}>
          <Typography variant="body2" sx={FooterStyle.copyright} dir="ltr">
            {footer?.copyrightText ?? `© ${year} Nemesh`}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
