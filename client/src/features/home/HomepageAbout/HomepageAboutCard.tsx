"use client";

import { useState, useEffect, useRef, useCallback, useId } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTheme } from "@mui/material/styles";
import { BlockRenderer, NemeshImage } from "@/components/shared";
import type { Image, BlockNode } from "@/types/domain";
import { HomepageAboutStyle } from "./HomepageAbout.style";

const COLLAPSED_HEIGHT_MOBILE = 360;
const COLLAPSED_HEIGHT_DESKTOP_FALLBACK = 480;

type Props = {
  title: string;
  body: BlockNode[];
  image: Image;
};

/**
 * Expandable About card — client component.
 *
 * Layout:
 *   Desktop (RTL): image floats to physical left (float: inline-end in RTL),
 *   text wraps to its right initially, then continues beneath the image when
 *   expanded.  Uses CSS overflow:hidden on the clipping container for both
 *   height clipping and BFC float containment.
 *
 *   Mobile: vertical stack — no float.
 *
 * Height measurement:
 *   collapsed height ≈ rendered image height on desktop (measured via
 *   ResizeObserver after mount); fixed 360px on mobile.  collapsedHeight===0
 *   before first measurement — the component renders height:"auto" in that
 *   state so SSR HTML and the initial client render are identical (no hydration
 *   mismatch).  The snap to measured height is instant because CSS cannot
 *   animate auto → px.
 */
export default function HomepageAboutCard({ title, body, image }: Props) {
  const bodyId = useId();
  const contentRef = useRef<HTMLDivElement>(null);
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
    const collapsed = isMobile
      ? COLLAPSED_HEIGHT_MOBILE
      : imgH > 10
      ? imgH
      : COLLAPSED_HEIGHT_DESKTOP_FALLBACK;

    const full = contentRef.current.scrollHeight;
    setCollapsedHeight(collapsed);
    setFullHeight(full);
    // 8px buffer prevents showing the button when content is only marginally taller.
    setHasOverflow(full > collapsed + 8);
  }, [mdBreakpoint]);

  useEffect(() => {
    const obs = new ResizeObserver(measure);
    if (contentRef.current) obs.observe(contentRef.current);
    if (imageRef.current) obs.observe(imageRef.current);
    return () => obs.disconnect();
  }, [measure]);

  // Card background for the fade gradient — must match HomepageAboutStyle.card.
  const cardBg = theme.palette.background.paper;
  const fadeGradient = `linear-gradient(to top, ${cardBg} 0%, ${cardBg}CC 35%, transparent 100%)`;

  // collapsedHeight===0 means not yet measured (SSR / pre-hydration).
  // Use height:"auto" in that state so the server HTML and first client render match.
  const contentHeight =
    collapsedHeight === 0 ? "auto" : expanded ? `${fullHeight}px` : `${collapsedHeight}px`;

  return (
    <Box sx={HomepageAboutStyle.card}>
      <Typography variant="h2" sx={HomepageAboutStyle.title}>
        {title}
      </Typography>

      <Box sx={HomepageAboutStyle.contentOuter}>
        {/* Clipping container: overflow:hidden clips height AND contains the float. */}
        <Box
          id={bodyId}
          ref={contentRef}
          sx={{ ...HomepageAboutStyle.contentInner, height: contentHeight }}
        >
          {/* Image — floated to physical left on desktop (inline-end in RTL). */}
          <Box ref={imageRef} sx={HomepageAboutStyle.imageWrapper}>
            <NemeshImage
              image={image}
              fill
              objectFit="cover"
              alt={image.alt || title}
              sizes="(max-width: 899px) 100vw, 40vw"
              priority
            />
          </Box>

          {/* Rich-text body. Clipped when collapsed; flows beneath the float when expanded. */}
          <BlockRenderer blocks={body} />

          {/* Explicit clearfix — ensures scrollHeight reliably includes the float
              height on all browsers even if the BFC from overflow:hidden behaves
              slightly differently across engines. */}
          <Box component="span" aria-hidden sx={{ display: "block", clear: "both" }} />
        </Box>

        {/* Fade overlay — fades into the card background, visible only when truncated. */}
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

      {/* Expand/collapse control — rendered only when there is actual overflow. */}
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
