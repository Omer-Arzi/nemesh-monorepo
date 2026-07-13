"use client";

import { useState, useEffect, useRef, useCallback, useId } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTheme } from "@mui/material/styles";
import { BlockRenderer, NemeshImage } from "@/components/shared";
import type { Image, BlockNode } from "@/types/domain";
import { HomepageAboutStyle } from "./HomepageAbout.style";

const COLLAPSED_HEIGHT_MOBILE = 300;
const COLLAPSED_HEIGHT_DESKTOP_FALLBACK = 360;

type Props = {
  title: string;
  body: BlockNode[];
  image: Image;
};

/**
 * Expandable About card — client component.
 *
 * Structural contract:
 *   The outer card and imageWrapper are never clipped. Only textClipper
 *   (text body) receives overflow:hidden + animated height.
 *
 * Desktop layout (RTL):
 *   imageAndTextArea has display:flow-root (BFC). imageWrapper floats
 *   inline-end (physical left in RTL). textClipper is a BFC block that
 *   sits beside the float (physical right). Text in textClipper extends
 *   taller than the float in the expanded state, creating the "text
 *   continues beneath the image" visual behaviour.
 *
 * Mobile:
 *   No float — imageWrapper stacks above textClipper.
 *
 * Measurement:
 *   contentRef is on textClipper (text-only). collapsedHeight ≈ image
 *   height so the collapsed text area matches the image's visual height.
 *   fullHeight = textClipper.scrollHeight. Both recalculate on resize
 *   via ResizeObserver. collapsedHeight===0 before first measurement →
 *   height:"auto" avoids hydration mismatch.
 */
export default function HomepageAboutCard({ title, body, image }: Props) {
  const bodyId = useId();
  // textClipper — only the text area is measured and clipped.
  const contentRef = useRef<HTMLDivElement>(null);
  // imageWrapper — measured for collapsedHeight; never inside the clip boundary.
  const imageRef = useRef<HTMLDivElement>(null);

  const [expanded, setExpanded] = useState(false);
  const [collapsedHeight, setCollapsedHeight] = useState(0);
  const [fullHeight, setFullHeight] = useState(0);
  const [hasOverflow, setHasOverflow] = useState(false);

  const theme = useTheme();
  const mdBreakpoint = theme.breakpoints.values.md;

  const measure = useCallback(() => {
    if (!contentRef.current || !imageRef.current) return;

    const isMobile = window.innerWidth < mdBreakpoint;
    const imgH = imageRef.current.getBoundingClientRect().height;
    // On desktop: collapse text to ≈ image height so the initial visible area
    // matches the image's visual footprint. On mobile: fixed height.
    const collapsed = isMobile
      ? COLLAPSED_HEIGHT_MOBILE
      : imgH > 10
      ? imgH
      : COLLAPSED_HEIGHT_DESKTOP_FALLBACK;

    // scrollHeight of textClipper only — image is outside the measurement boundary.
    const full = contentRef.current.scrollHeight;
    setCollapsedHeight(collapsed);
    setFullHeight(full);
    // 8px buffer avoids showing the control when content is only marginally taller.
    setHasOverflow(full > collapsed + 8);
  }, [mdBreakpoint]);

  useEffect(() => {
    const obs = new ResizeObserver(measure);
    if (contentRef.current) obs.observe(contentRef.current);
    if (imageRef.current) obs.observe(imageRef.current);
    return () => obs.disconnect();
  }, [measure]);

  const cardBg = theme.palette.background.paper;
  const fadeGradient = `linear-gradient(to top, ${cardBg} 0%, ${cardBg}CC 35%, transparent 100%)`;

  // collapsedHeight===0 → not yet measured. Use "auto" to match SSR output.
  const textClipperHeight =
    collapsedHeight === 0 ? "auto" : expanded ? `${fullHeight}px` : `${collapsedHeight}px`;

  return (
    <Box sx={HomepageAboutStyle.card}>
      <Typography variant="h4" sx={HomepageAboutStyle.title}>
        {title}
      </Typography>

      {/*
       * imageAndTextArea — display:flow-root BFC.
       * Contains the float and grows to the full image height automatically.
       * No overflow restriction: card border and shadow are always intact.
       */}
      <Box sx={HomepageAboutStyle.imageAndTextArea}>
        {/*
         * imageWrapper — floated inline-end (physical left in RTL).
         * Sibling of textClipper, never inside it.
         * The image is always fully visible regardless of the collapsed state.
         */}
        <Box ref={imageRef} sx={HomepageAboutStyle.imageWrapper}>
          <NemeshImage
            image={image}
            fill
            objectFit="cover"
            alt={image.alt || title}
            sizes="(max-width: 899px) 100vw, 280px"
            priority
          />
        </Box>

        {/*
         * textClipper — the ONLY element that owns overflow:hidden + height.
         * As a BFC block it sits beside the float (physical right in RTL).
         * When expanded and taller than the float, text extends beneath the
         * image visually, satisfying the "text continues below" requirement.
         *
         * The fade lives here so it covers only the text area, not the image.
         */}
        <Box
          id={bodyId}
          ref={contentRef}
          sx={{ ...HomepageAboutStyle.textClipper, height: textClipperHeight }}
        >
          <BlockRenderer blocks={body} />

          {/* Fade — absolute inside textClipper. Covers only the text bottom. */}
          {hasOverflow && (
            <Box
              aria-hidden
              sx={{
                ...HomepageAboutStyle.fade,
                background: fadeGradient,
                opacity: expanded ? 0 : 1,
              }}
            />
          )}
        </Box>
      </Box>

      {/*
       * expandControls — outside imageAndTextArea and outside textClipper.
       * Always fully visible; never inside a clipped or overflow-hidden region.
       */}
      {hasOverflow && (
        <Box sx={HomepageAboutStyle.expandControls}>
          <Box
            component="button"
            type="button"
            aria-expanded={expanded}
            aria-controls={bodyId}
            onClick={() => setExpanded((prev) => !prev)}
            sx={HomepageAboutStyle.expandButton}
          >
            {/* RTL flex row: text on physical right (start), icon on physical left (end). */}
            <Typography component="span" variant="body2" sx={{ fontWeight: 600 }}>
              {expanded ? "הצג פחות" : "להמשך קריאה"}
            </Typography>
            <ExpandMoreIcon
              sx={{
                ...HomepageAboutStyle.expandIcon,
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}
