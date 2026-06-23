"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import type { SxProps, Theme } from "@mui/material/styles";
import type { Recipe } from "@/types/domain";
import { DIFFICULTY_LABEL } from "@/lib/i18n/labels";
import { formatPrepTime } from "@/lib/formatters/prepTime";
import { RecipeHeroStyle } from "./styles/RecipeHeroStyle";

// Descriptions longer than this are truncated until the user expands them.
const DESCRIPTION_CHAR_LIMIT = 200;

// Returns the index of the last space or newline at or before `limit`,
// so the visible text always ends at a word boundary.
function splitAtWordBoundary(text: string, limit: number): number {
  if (text.length <= limit) return text.length;
  for (let i = limit; i > Math.max(0, limit - 40); i--) {
    if (text[i] === " " || text[i] === "\n") return i;
  }
  return limit;
}

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

  const hasMetaStats = prepTime != null || difficulty != null || servings != null;
  const primaryCategory = categories[0] ?? null;

  const desc = description?.trim() ?? null;
  const isLong = !!desc && desc.length > DESCRIPTION_CHAR_LIMIT;
  const splitAt = isLong ? splitAtWordBoundary(desc, DESCRIPTION_CHAR_LIMIT) : (desc?.length ?? 0);
  const visiblePart = desc?.slice(0, splitAt) ?? null;
  const hiddenPart = isLong ? desc.slice(splitAt) : null;

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
              onClick={isLong ? () => setExpanded((prev) => !prev) : undefined}
              sx={isLong ? { cursor: "pointer", userSelect: "none" } : undefined}
              role={isLong ? "button" : undefined}
              aria-expanded={isLong ? expanded : undefined}
            >
              {/* Always-visible portion */}
              <Typography variant="body1" sx={RecipeHeroStyle.description}>
                {visiblePart}
                {isLong && !expanded && (
                  <Box component="span" sx={RecipeHeroStyle.readMore}>
                    {"…"}
                  </Box>
                )}
              </Typography>

              {/* Animated expansion — grid-template-rows: 0fr → 1fr
                  expands to the exact height of the hidden content. */}
              {isLong && (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateRows: expanded ? "1fr" : "0fr",
                    transition: "grid-template-rows 0.35s ease",
                  }}
                >
                  <Box sx={RecipeHeroStyle.descriptionExpanderInner}>
                    <Typography variant="body1" sx={RecipeHeroStyle.description}>
                      {hiddenPart}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {hasMetaStats && (
            <>
              <Divider sx={RecipeHeroStyle.divider} />
              <Box sx={RecipeHeroStyle.metaRow}>
                {prepTime != null && (
                  <HeroStat label="זמן הכנה" value={formatPrepTime(prepTime)} />
                )}
                {difficulty != null && (
                  <HeroStat label="רמת קושי" value={DIFFICULTY_LABEL[difficulty]} />
                )}
                {servings != null && (
                  <HeroStat label="מנות" value={String(servings)} />
                )}
              </Box>
            </>
          )}
        </Box>

        {/* ── Image column (LEFT in RTL — column 2) ───────────────── */}
        <Box sx={RecipeHeroStyle.imageColumn}>
          {image ? (
            <Box
              component="img"
              src={image.url}
              alt={image.alt}
              sx={RecipeHeroStyle.image}
            />
          ) : (
            <Box sx={RecipeHeroStyle.imageFallback}>
              <RestaurantIcon sx={RecipeHeroStyle.imageFallbackIcon} />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
