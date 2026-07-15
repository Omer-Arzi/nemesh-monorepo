"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { BlockRenderer } from "@/components/shared";
import type { Page, BlockNode, BlockInlineNode } from "@/types/domain";

type Props = {
  page: Page;
};

function getPlainText(children: BlockInlineNode[]): string {
  return children
    .map((child) => (child.type === "link" ? getPlainText(child.children) : child.text))
    .join("");
}

// The dedicated title field below is always the page's single H1. A heading
// block in the rich-text body whose text duplicates it is therefore a CMS
// authoring artifact (title pasted into both places), never intentional
// content — dropped structurally by comparing against the actual title
// field, not by matching any specific string.
function isDuplicateTitleHeading(block: BlockNode, title: string): boolean {
  if (block.type !== "heading") return false;
  return getPlainText(block.children).trim().toLowerCase() === title.trim().toLowerCase();
}

export default function StaticPageClient({ page }: Props) {
  const content = page.content.filter((block) => !isDuplicateTitleHeading(block, page.title));

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
        {content.length > 0 && (
          <>
            <Divider sx={{ mb: 4 }} />
            <BlockRenderer blocks={content} />
          </>
        )}
      </Box>
    </Container>
  );
}
