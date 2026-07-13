"use client";

import { useState, useEffect, useLayoutEffect, useRef, useCallback, useId } from "react";
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
 * Flash prevention:
 *   collapsedHeight starts at COLLAPSED_HEIGHT_DESKTOP_FALLBACK so SSR and
 *   the initial client render emit the same height (no hydration mismatch).
 *   useLayoutEffect fires before the first browser paint and corrects to the
 *   real measured value. transitionActive starts false so the initial
 *   correction is an instant snap rather than a 320ms animation.
 */
export default function HomepageAboutCard({ title, body, image }: Props) {
  const bodyId = useId();
  // textClipper — only the text area is measured and clipped.
  const contentRef = useRef<HTMLDivElement>(null);
  // imageWrapper — measured for collapsedHeight; never inside the clip boundary.
  const imageRef = useRef<HTMLDivElement>(null);

  const [expanded, setExpanded] = useState(false);
  // Starts at the desktop fallback so SSR and initial client render agree:
  // both output height:360px. useLayoutEffect corrects to the measured value
  // before the first browser paint, so the user never sees this fallback height.
  const [collapsedHeight, setCollapsedHeight] = useState(COLLAPSED_HEIGHT_DESKTOP_FALLBACK);
  const [fullHeight, setFullHeight] = useState(0);
  const [hasOverflow, setHasOverflow] = useState(false);
  // Transition is disabled until after the first measurement so the initial
  // height correction (360px → measured px) is an instant snap, not an animation.
  // Set inside measure() rather than directly in an effect body to avoid the
  // react-hooks/set-state-in-effect lint rule.
  const [transitionActive, setTransitionActive] = useState(false);

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
    // Enable transition now that a real measurement exists. Idempotent on resize.
    setTransitionActive(true);
  }, [mdBreakpoint]);

  // Pre-paint measurement: runs synchronously after DOM commit, before the browser
  // paints. Corrects collapsedHeight from the SSR fallback to the measured value
  // so the user never sees the uncollapsed text. useLayoutEffect is a no-op on
  // the server so SSR still outputs the stable initial state (360px); client
  // hydration matches; then this effect fires and corrects before first paint.
  // Empty deps is intentional — first-mount pre-paint pass only; subsequent
  // recalculation is handled by the ResizeObserver below.
  useLayoutEffect(() => {
    measure();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Subsequent resize recalculation via ResizeObserver (asynchronous, post-paint).
  useEffect(() => {
    const obs = new ResizeObserver(measure);
    if (contentRef.current) obs.observe(contentRef.current);
    if (imageRef.current) obs.observe(imageRef.current);
    return () => obs.disconnect();
  }, [measure]);

  const cardBg = theme.palette.background.paper;
  const fadeGradient = `linear-gradient(to top, ${cardBg} 0%, ${cardBg}CC 35%, transparent 100%)`;

  // Pre-measurement (!transitionActive): constrained at the fallback height —
  //   text is safely collapsed and transition is suppressed.
  // Post-measurement, no overflow: "auto" removes the clip; short text is shown
  //   fully without a button or fade.
  // Post-measurement, overflow: pixel height — collapses or expands with the
  //   320ms CSS transition.
  const textClipperHeight = !transitionActive
    ? `${COLLAPSED_HEIGHT_DESKTOP_FALLBACK}px`
    : !hasOverflow
    ? "auto"
    : expanded
    ? `${fullHeight}px`
    : `${collapsedHeight}px`;

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
         *
         * transition is suppressed while !transitionActive so the initial
         * height correction (fallback → measured) is an instant snap. CSS
         * guarantees no animation when the before-change style had
         * transition:none, even if transition:320ms is set in the same commit.
         */}
        <Box
          id={bodyId}
          ref={contentRef}
          sx={{
            ...HomepageAboutStyle.textClipper,
            height: textClipperHeight,
            ...(!transitionActive && { transition: "none" }),
          }}
        >
          <BlockRenderer blocks={body} />

          {/* Fade — absolute inside textClipper, covers only the text bottom.
              Gated on transitionActive so it is hidden until measurement
              confirms real overflow. */}
          {hasOverflow && transitionActive && (
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
       * Gated on transitionActive so it is hidden until measurement confirms
       * real overflow.
       */}
      {hasOverflow && transitionActive && (
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
