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
  const [hasMeasured, setHasMeasured] = useState(false);
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
      setHasMeasured(true);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [desc, clampActive]);

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

  const useClampVisual = !hasMeasured || (isOverflowing && clampActive);
  const maxHeight = heights ? (expanded ? heights.full : heights.collapsed) : undefined;

  return (
    <Box sx={{ ...RecipeHeroStyle.root, ...sx }}>
      <Box sx={RecipeHeroStyle.grid}>
        {/* ── Content column (RIGHT in RTL — column 1) ────────────── */}
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
              sx={isOverflowing ? { cursor: "pointer", userSelect: "none" } : undefined}
              role={isOverflowing ? "button" : undefined}
              aria-expanded={isOverflowing ? expanded : undefined}
            >
              <Typography
                ref={descRef}
                variant="body1"
                onTransitionEnd={handleTransitionEnd}
                sx={{
                  ...(useClampVisual ? RecipeHeroStyle.descriptionClamp : RecipeHeroStyle.descriptionExpanded),
                  overflow: "hidden",
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

        {/* ── Image column (LEFT in RTL — column 2) ───────────────── */}
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
      </Box>
    </Box>
  );
}
