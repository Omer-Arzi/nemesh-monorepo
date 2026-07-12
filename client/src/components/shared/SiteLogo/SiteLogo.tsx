"use client";

import { useState, useRef } from "react";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { useBranding } from "@/providers/BrandingProvider";

/** Local bundled fallback paths — always present in the repository. */
const LOCAL_FALLBACK = {
  desktop: "/images/branding/logo.svg",
  mobile: "/images/branding/logo-mobile.svg",
} as const;

export type SiteLogoVariant = "desktop" | "mobile";

type Props = {
  /** "desktop" → full logo; "mobile" → compact/icon logo. */
  variant: SiteLogoVariant;
  /** Passed directly to the <img> element — controls size, display, etc. */
  sx?: SxProps<Theme>;
  /** Alt text. Leave empty ("") when the wrapping link already has aria-label. */
  alt?: string;
  tabIndex?: number;
};

/**
 * Renders the site logo from the Strapi-managed branding asset when available,
 * falling back to the local bundled SVG on missing config or load failure.
 *
 * - "desktop" variant: branding.logo  → /images/branding/logo.svg
 * - "mobile" variant:  branding.mobileLogo → /images/branding/logo-mobile.svg
 *
 * Fallback is applied once on error; subsequent onError calls are ignored to
 * prevent infinite retry loops if the local file is also unavailable.
 */
export default function SiteLogo({ variant, sx, alt = "", tabIndex }: Props) {
  const branding = useBranding();

  const cmsSrc =
    variant === "desktop"
      ? (branding.logo?.url ?? null)
      : (branding.mobileLogo?.url ?? null);

  const [src, setSrc] = useState<string>(() => cmsSrc ?? LOCAL_FALLBACK[variant]);
  const appliedFallback = useRef(false);

  function handleError() {
    if (!appliedFallback.current) {
      appliedFallback.current = true;
      setSrc(LOCAL_FALLBACK[variant]);
    }
  }

  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      onError={handleError}
      sx={sx}
      tabIndex={tabIndex}
    />
  );
}
