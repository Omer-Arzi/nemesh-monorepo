"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import MuiLink from "@mui/material/Link";
import NextLink from "next/link";
import { FreckleDust } from "@/components/shared";
import { useFooter } from "@/features/page/hooks";
import { FooterStyle } from "./styles/FooterStyle";

export default function Footer() {
  const { data: footer } = useFooter();
  const year = new Date().getFullYear();
  const hasSections = !!footer?.sections?.length;

  return (
    <Box component="footer" sx={FooterStyle.root}>
      <FreckleDust placement="top-right" density="low" />
      <Container maxWidth="lg">
        {hasSections && (
          <Grid container spacing={4} sx={FooterStyle.sections}>
            {footer!.sections.map((section, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="subtitle2" sx={FooterStyle.sectionTitle}>
                  {section.title}
                </Typography>
                <Box component="ul" sx={FooterStyle.linkList}>
                  {section.links.map((link, j) => {
                    const href = link.page
                      ? `/${link.page.slug}`
                      : (link.externalUrl ?? "#");
                    const label =
                      link.customLabel ?? link.page?.title ?? link.externalUrl ?? "";
                    return (
                      <Box key={j} component="li" sx={FooterStyle.linkItem}>
                        <MuiLink
                          component={NextLink}
                          href={href}
                          sx={FooterStyle.link}
                          {...(link.openInNewTab
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : {})}
                        >
                          {label}
                        </MuiLink>
                      </Box>
                    );
                  })}
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
