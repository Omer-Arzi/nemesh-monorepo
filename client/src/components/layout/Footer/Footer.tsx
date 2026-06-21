"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { FooterStyle } from "./styles/FooterStyle";

/**
 * Site-wide footer.
 *
 * Currently a minimal placeholder bar.
 * All content regions are intentionally empty — replace once the footer
 * information architecture is decided (links, copyright, social, legal, etc.).
 *
 * Uses `mt: "auto"` on the parent (via AppShell's flex column) to push the
 * footer to the bottom of short pages without position: fixed.
 *
 * TODO: Add real footer sections — links, copyright line, social icons, etc.
 */
export default function Footer() {
  return (
    <Box component="footer" sx={FooterStyle.root}>
      <Container maxWidth="lg">
        {/* TODO: Replace with actual footer layout */}
        <Typography variant="body2" color="text.secondary" sx={FooterStyle.text}>
          Nemesh
        </Typography>
      </Container>
    </Box>
  );
}
