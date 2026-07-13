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
// Fallback used for SSR + pre-measurement client render. Must be the same in
// both environments to avoid hydration mismatch. Approximates a desktop image
// height (~350px) plus the reserved controls row (~40px) plus a small buffer.
const COLLAPSED_HEIGHT_DESKTOP_FALLBACK = 400;
// Intrinsic button row height (6px + ~21px text + 6px = ~33px) and the
// mt:0.5 gap (4px) that separates the button from the textClipper.
// These are included in the collapsed height so text fills the controls
// zone, reducing the perceived dead space between the fade and the button.
const EXPAND_CONTROLS_HEIGHT = 33;
const CONTROLS_GAP = 4;

type Props = {
  title: string | null;
  body: BlockNode[];
  image: Image;
};

// Returns true when the click originated from or inside an interactive element.
// Used to let links and buttons in the rich text process clicks normally.
function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return !!target.closest('a, button, input, select, textarea, [role="button"]');
}

// Returns true when the user has an active text selection at click time.
// Prevents expansion after drag-to-select gestures.
function hasTextSelection(): boolean {
  const sel = typeof window !== "undefined" ? window.getSelection() : null;
  return !!sel && sel.toString().trim().length > 0;
}

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
 *   sits beside the float (physical right). In the collapsed state the
 *   textClipper height exceeds the image height so text extends below
 *   image level before fading out, using the full available card height.
 *   In the expanded state text flows freely past the image.
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
  // both output height:400px. useLayoutEffect corrects to the measured value
  // before the first browser paint, so the user never sees this fallback height.
  const [collapsedHeight, setCollapsedHeight] = useState(COLLAPSED_HEIGHT_DESKTOP_FALLBACK);
  const [fullHeight, setFullHeight] = useState(0);
  const [hasOverflow, setHasOverflow] = useState(false);
  // Transition is disabled until after the first measurement so the initial
  // height correction is an instant snap, not an animation. Set inside
  // measure() rather than directly in an effect body to avoid the
  // react-hooks/set-state-in-effect lint rule.
  const [transitionActive, setTransitionActive] = useState(false);

  const theme = useTheme();
  const mdBreakpoint = theme.breakpoints.values.md;

  const measure = useCallback(() => {
    if (!contentRef.current || !imageRef.current) return;

    const isMobile = window.innerWidth < mdBreakpoint;
    const imgH = imageRef.current.getBoundingClientRect().height;

    // On desktop: collapsed height = image height + the space occupied by the
    // expand controls row (button + gap). Absorbing the controls into the
    // textClipper height means text fills the full card footprint and the
    // button appears immediately after the fade with only a 4px visual gap.
    // On mobile: fixed height (no float layout; image stacks above the text).
    const collapsed = isMobile
      ? COLLAPSED_HEIGHT_MOBILE
      : imgH > 10
      ? imgH + EXPAND_CONTROLS_HEIGHT + CONTROLS_GAP
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
  // the server so SSR still outputs the stable initial state (400px); client
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

  // Expand when the user clicks the collapsed text body. Guards:
  //   • Only fires when collapsed and overflow is confirmed.
  //   • Skips clicks that originated from interactive descendants (links, buttons)
  //     so rich-text links continue to work normally.
  //   • Skips when the user has an active text selection to avoid expanding
  //     after drag-to-select gestures.
  const handleTextAreaClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isInteractiveTarget(e.target)) return;
      if (hasTextSelection()) return;
      setExpanded(true);
    },
    [],
  );

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

  // Text area is clickable-to-expand only while collapsed and overflow is confirmed.
  const clickable = !expanded && hasOverflow && transitionActive;

  return (
    <Box sx={HomepageAboutStyle.card}>
      {/*
       * Title is optional. When absent: no heading, no spacing, body starts
       * at the top of the card content. Component="h2" keeps heading hierarchy
       * correct regardless of the visual variant used.
       */}
      {title && (
        <Typography variant="h5" component="h2" sx={HomepageAboutStyle.title}>
          {title}
        </Typography>
      )}

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
            alt={image.alt || title || ""}
            sizes="(max-width: 899px) 100vw, 280px"
            priority
          />
        </Box>

        {/*
         * textClipper — the ONLY element that owns overflow:hidden + height.
         * As a BFC block it sits beside the float (physical right in RTL).
         * Collapsed height = image height + controls row height + gap, so text
         * extends below image level before fading. In expanded state text flows
         * freely past the image and the full scrollHeight is used.
         *
         * Click handler expands the section when collapsed and overflow exists,
         * but skips clicks from interactive descendants and text-selection drags.
         * transition is suppressed while !transitionActive so the initial
         * height correction (fallback → measured) is an instant snap.
         */}
        <Box
          id={bodyId}
          ref={contentRef}
          onClick={clickable ? handleTextAreaClick : undefined}
          sx={{
            ...HomepageAboutStyle.textClipper,
            height: textClipperHeight,
            ...(!transitionActive && { transition: "none" }),
            ...(clickable && { cursor: "pointer" }),
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
