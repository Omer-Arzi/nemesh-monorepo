"use client";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import NextLink from "next/link";
import { ROUTES } from "@/constants";
import { HomepageAboutStyle } from "./HomepageAbout.style";

/**
 * Split out from HomepageAboutCard (a Server Component) into its own
 * "use client" component. MuiLink's `component` prop needs an actual
 * function reference (NextLink) — passing a function as a prop from a
 * Server Component into a Client Component can't cross the RSC boundary
 * ("Functions cannot be passed directly to Client Components"). Keeping
 * this split out, rather than marking the whole card "use client", keeps
 * the card's image/text rendering server-rendered.
 *
 * Always rendered by its caller — this preview is always a preview of the
 * full About page, a permanent route regardless of whether this homepage
 * teaser has Strapi content.
 */
export default function AboutReadMoreLink() {
  return (
    <Link
      component={NextLink}
      href={ROUTES.ABOUT}
      underline="none"
      sx={HomepageAboutStyle.readMoreLink}
    >
      <Box component="span">קרא עוד</Box>
      <Box component="span" className="about-arrow" sx={HomepageAboutStyle.readMoreArrow} aria-hidden>
        ⟵
      </Box>
    </Link>
  );
}
