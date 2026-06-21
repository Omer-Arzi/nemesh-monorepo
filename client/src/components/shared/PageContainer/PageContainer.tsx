"use client";

import Container, { type ContainerProps } from "@mui/material/Container";
import { PageContainerStyle } from "./styles/PageContainerStyle";

type Props = ContainerProps;

/**
 * Standard page content wrapper.
 *
 * Provides the default horizontal max-width (lg) and vertical rhythm (py)
 * used on most pages.  Import and wrap page content with this instead of
 * reaching for Container directly, so layout decisions stay centralised.
 *
 * When to use:
 *   - Standard content pages (recipe list, category pages, etc.)
 *
 * When to skip:
 *   - Full-bleed hero sections — use a plain Box or a separate section
 *   - Pages with custom layout requirements
 *
 * All MUI Container props are forwarded, so `maxWidth`, `sx`, etc. can
 * be overridden per-call when a specific page needs something different.
 */
export default function PageContainer({ sx, children, ...props }: Props) {
  return (
    <Container
      maxWidth="lg"
      sx={{ ...PageContainerStyle.root, ...sx }}
      {...props}
    >
      {children}
    </Container>
  );
}
