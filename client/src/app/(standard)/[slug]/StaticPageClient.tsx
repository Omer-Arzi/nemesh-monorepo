"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { BlockRenderer } from "@/components/shared";
import type { Page } from "@/types/domain";

type Props = {
  page: Page;
};

export default function StaticPageClient({ page }: Props) {
  return (
    <Container maxWidth={false} sx={{ maxWidth: 800, px: { xs: 2, sm: 4 }, py: { xs: 4, md: 6 } }}>
      <Box component="article">
        {/* ── Page header ─────────────────────────────────────────────── */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: page.summary ? 1 : 0 }}>
            {page.title}
          </Typography>
          {page.summary && (
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              {page.summary}
            </Typography>
          )}
        </Box>

        {/* ── Content body ────────────────────────────────────────────── */}
        {page.content.length > 0 && (
          <>
            <Divider sx={{ mb: 4 }} />
            <BlockRenderer blocks={page.content} />
          </>
        )}
      </Box>
    </Container>
  );
}
