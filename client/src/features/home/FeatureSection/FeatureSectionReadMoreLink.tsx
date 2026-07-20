"use client";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import NextLink from "next/link";
import { FeatureSectionStyle } from "./FeatureSection.style";

type Props = {
  href: string;
  label: string;
};

/**
 * Split out into its own "use client" component for the same reason as
 * HomepageAbout's AboutReadMoreLink: MuiLink's `component` prop needs an
 * actual function reference (NextLink), which can't cross the Server ->
 * Client Component boundary from a plain prop.
 */
export default function FeatureSectionReadMoreLink({ href, label }: Props) {
  return (
    <Link component={NextLink} href={href} underline="none" sx={FeatureSectionStyle.readMoreLink}>
      <Box component="span">{label}</Box>
      <Box
        component="span"
        className="feature-section-arrow"
        sx={FeatureSectionStyle.readMoreArrow}
        aria-hidden
      >
        ⟵
      </Box>
    </Link>
  );
}
