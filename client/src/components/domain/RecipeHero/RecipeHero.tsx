"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { TransitionEvent } from "react";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import type { SxProps, Theme } from "@mui/material/styles";
import type { Recipe } from "@/types/domain";
import { DIFFICULTY_LABEL } from "@/lib/i18n/labels";
import { formatPrepTime } from "@/lib/formatters/prepTime";
import { NemeshImage } from "@/components/shared";
import { RecipeHeroStyle } from "./styles/RecipeHeroStyle";
import { RecipeHeroText } from "./RecipeHero.consts";

type Props = Pick<
  Recipe,
  "title" | "image" | "description" | "categories" | "prepTime" | "servings" | "difficulty"
> & {
  sx?: SxProps<Theme>;
};

// Stat chip: label above, value below, contained in a warm surface card.
// Used only inside the hero — not exported.
function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={RecipeHeroStyle.statChip}>
      <Typography component="span" sx={RecipeHeroStyle.statLabel}>
        {label}
      </Typography>
      <Typography component="p" sx={RecipeHeroStyle.statValue}>
        {value}
      </Typography>
    </Box>
  );
}

export default function RecipeHero({
  title,
  image,
  description,
  categories,
  prepTime,
  servings,
  difficulty,
  sx,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  // Whether the crisp, browser-native N-line clamp (with ellipsis) is the
  // active visual — as opposed to the full, unclamped text. Kept separate
  // from `expanded` so collapsing can be animated: reapplying the clamp the
  // instant `expanded` flips to false would cut the text to N lines before
  // the max-height transition has actually finished shrinking the box. See
  // handleTransitionEnd. Starts true so the very first paint (including SSR,
  // where no measurement is possible yet) is never the unclamped full text —
  // for a long description that would flash the whole thing briefly; for a
  // short one it only means embedded paragraph breaks briefly render as
  // spaces until measurement corrects it, a much smaller cost.
  const [clampActive, setClampActive] = useState(true);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [heights, setHeights] = useState<{ collapsed: number; full: number } | null>(null);
  const descRef = useRef<HTMLParagraphElement>(null);

  const hasMetaStats = prepTime != null || difficulty != null || servings != null;
  const primaryCategory = categories[0] ?? null;

  const desc = description?.trim() ?? null;

  // Measures the real rendered box while the clamp is active: `clientHeight`
  // is the natural N-line clamped height, `scrollHeight` is the true full
  // content height (scrollHeight ignores `overflow: hidden` clipping) — both
  // come from one measurement, no guessed/theme-derived numbers involved.
  // Re-measures on width changes (ResizeObserver) so a different breakpoint
  // or orientation change stays accurate. Only meaningful while `clampActive`
  // — once unclamped, clientHeight === scrollHeight and would overwrite the
  // real figures with a stale pair.
  useLayoutEffect(() => {
    const el = descRef.current;
    if (!el || !desc || !clampActive) return;

    const measure = () => {
      setHeights({ collapsed: el.clientHeight, full: el.scrollHeight });
      setIsOverflowing(el.scrollHeight - el.clientHeight > 1);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [desc, clampActive]);

  // The effect above stops re-measuring the instant `clampActive` goes
  // false (right when expanding starts), so `heights.full` freezes at the
  // value measured while the box was still narrow/clamped. Once genuinely
  // expanded, the box switches to `descriptionExpanded`'s unconstrained
  // width (so it can flow beside/past the floated image — see
  // RecipeHeroStyle.ts), which reflows the text at a different width than
  // it was measured at. Re-measure `full` here, at the box's real expanded
  // layout, before the max-height transition target is used, so the
  // animation grows to the correct height instead of a stale one.
  useLayoutEffect(() => {
    const el = descRef.current;
    if (!el || !desc || !expanded) return;

    const measureFull = () => {
      const full = el.scrollHeight;
      setHeights((prev) => (prev && prev.full !== full ? { ...prev, full } : prev));
    };

    measureFull();
    const ro = new ResizeObserver(measureFull);
    ro.observe(el);
    return () => ro.disconnect();
  }, [desc, expanded]);

  const handleToggle = useCallback(() => {
    setExpanded((prev) => {
      const next = !prev;
      // Expanding: reveal the full text immediately. Removing the clamp
      // while max-height grows never glitches — more of the already-present
      // text just becomes visible as the box grows.
      if (next) setClampActive(false);
      return next;
    });
  }, []);

  const handleTransitionEnd = useCallback(
    (e: TransitionEvent<HTMLParagraphElement>) => {
      // Collapsing: wait for the max-height shrink to finish before
      // reapplying the clamp, so the ellipsis appears once the box has
      // actually settled at the clamped height rather than snapping early.
      if (e.propertyName === "max-height" && !expanded) setClampActive(true);
    },
    [expanded],
  );

  // Only a genuinely-overflowing, actually-expanded description should get
  // the wide/floating layout. `!clampActive` alone would be wrong: it's
  // also true for short descriptions that never overflowed in the first
  // place (nothing to expand), which must keep the narrow clamp width
  // forever, matching today's appearance, rather than widen just because
  // this component now has a wider style to offer.
  const useWideFlow = isOverflowing && !clampActive;
  const maxHeight = heights ? (expanded ? heights.full : heights.collapsed) : undefined;

  return (
    <Box sx={{ ...RecipeHeroStyle.root, ...sx }}>
      <Box sx={RecipeHeroStyle.layout}>
        {/* Image first in DOM so it can `float` at md+ and have the content
            below wrap it, then continue full-width past its bottom edge.
            `order` in RecipeHeroStyle restores today's visual stacking
            (content, then image) below `md`, where no float is active. */}
        <Box sx={RecipeHeroStyle.imageColumn}>
          <NemeshImage
            image={image}
            fill
            priority
            sizes="(max-width: 900px) 100vw, 50vw"
            objectFit="cover"
            fallback={
              <Box sx={RecipeHeroStyle.noImageState}>
                <RestaurantIcon sx={RecipeHeroStyle.noImageIcon} />
                <Typography sx={RecipeHeroStyle.noImageText}>אין תמונה</Typography>
              </Box>
            }
          />
        </Box>

        <Box sx={RecipeHeroStyle.contentColumn}>
          {primaryCategory && (
            <Box component="span" sx={RecipeHeroStyle.badge}>
              {primaryCategory.name}
            </Box>
          )}

          <Typography variant="h2" component="h1" sx={RecipeHeroStyle.title}>
            {title}
          </Typography>

          {desc && (
            <Box
              onClick={isOverflowing ? handleToggle : undefined}
              sx={{
                ...RecipeHeroStyle.descriptionWrapper,
                ...(isOverflowing ? { cursor: "pointer", userSelect: "none" } : null),
              }}
              role={isOverflowing ? "button" : undefined}
              aria-expanded={isOverflowing ? expanded : undefined}
            >
              <Typography
                ref={descRef}
                variant="body1"
                onTransitionEnd={handleTransitionEnd}
                sx={{
                  ...(useWideFlow ? RecipeHeroStyle.descriptionExpanded : RecipeHeroStyle.descriptionClamp),
                  // `overflow: hidden` establishes a block-formatting-context,
                  // which would make this box dodge the floated image as one
                  // rigid rectangle for its whole height instead of letting
                  // its individual line boxes wrap it — the opposite of the
                  // intended flow. Only safe for the clamp variant (always
                  // narrower than the image, never reaches its bottom edge).
                  // The wide/expanded variant instead uses `clip-path`, which
                  // clips paint only, without creating a BFC.
                  ...(useWideFlow
                    ? { overflow: "visible", clipPath: "inset(0)" }
                    : { overflow: "hidden" }),
                  transition: "max-height 0.35s ease",
                  maxHeight,
                }}
              >
                {desc}
              </Typography>
            </Box>
          )}

          {hasMetaStats && (
            <>
              <Divider sx={RecipeHeroStyle.divider} />
              <Box sx={RecipeHeroStyle.metaRow}>
                {prepTime != null && (
                  <HeroStat label={RecipeHeroText.prepTimeLabel} value={formatPrepTime(prepTime)} />
                )}
                {difficulty != null && (
                  <HeroStat label={RecipeHeroText.difficultyLabel} value={DIFFICULTY_LABEL[difficulty]} />
                )}
                {servings != null && (
                  <HeroStat label={RecipeHeroText.servingsLabel} value={String(servings)} />
                )}
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
