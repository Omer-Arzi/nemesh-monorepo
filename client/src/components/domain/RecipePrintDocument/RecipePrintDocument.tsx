"use client";

import { Fragment } from "react";
import Box from "@mui/material/Box";
import { ThemeProvider } from "@mui/material/styles";
import { lightTheme } from "@/lib/theme";
import { HEEBO_FONT_STACK } from "@/lib/fonts";
import { DIFFICULTY_LABEL } from "@/lib/i18n/labels";
import { formatPrepTime } from "@/lib/formatters/prepTime";
import { formatIngredientAmount } from "@/lib/formatters/ingredientAmount";
import { SiteLogo } from "@/components/shared";
import type { Recipe } from "@/types/domain";
import { RecipeHeroText } from "../RecipeHero/RecipeHero.consts";
import { PreparationStepsSectionText } from "../PreparationStepsSection/PreparationStepsSection.consts";
import { RecipePrintDocumentStyle as S } from "./styles/RecipePrintDocumentStyle";
import { RecipePrintDocumentText as T } from "./RecipePrintDocument.consts";

type Props = {
  recipe: Recipe;
  ref?: React.Ref<HTMLDivElement>;
};

function SectionHeading({ title }: { title: string }) {
  return (
    <Box sx={S.sectionHeadingBlock}>
      <Box component="h2" sx={S.sectionHeading}>
        {title}
      </Box>
      <Box sx={S.accent} />
    </Box>
  );
}

/**
 * Dedicated single-recipe print document — a hidden render subtree targeted by
 * `useReactToPrint` in RecipeContent. Renders from the already-fetched
 * `recipe` object; no new data fetch.
 *
 * Forced to the light theme so the printout is always near-black ink on white
 * paper regardless of the reader's on-screen colour mode. Owns its root reset
 * (`dir`, base type/colour, `print-color-adjust`) — the react-to-print iframe
 * inherits nothing from `<html>` / `CssBaseline`.
 *
 * Excluded by construction: description/intro, step photos, categories, tags,
 * related recipes, cooking mode, the on-screen control.
 */
export default function RecipePrintDocument({ recipe, ref }: Props) {
  const meta: { label: string; value: string }[] = [];
  if (recipe.servings != null) {
    meta.push({ label: RecipeHeroText.servingsLabel, value: String(recipe.servings) });
  }
  if (recipe.prepTime != null) {
    meta.push({ label: RecipeHeroText.prepTimeLabel, value: formatPrepTime(recipe.prepTime) });
  }
  if (recipe.totalTime != null) {
    meta.push({ label: RecipeHeroText.totalTimeLabel, value: formatPrepTime(recipe.totalTime) });
  }
  if (recipe.difficulty != null) {
    meta.push({ label: RecipeHeroText.difficultyLabel, value: DIFFICULTY_LABEL[recipe.difficulty] });
  }

  const equipment = recipe.specialEquipment
    .map((item) => item.name?.trim())
    .filter((name): name is string => !!name);

  const ingredientSections = recipe.ingredientSections.filter(
    (section) => section.ingredients.length > 0,
  );
  const ingredientsUnnamed =
    ingredientSections.length === 1 && !ingredientSections[0].title;

  const preparationSections = recipe.preparationSections.filter(
    (section) => section.steps.length > 0,
  );
  const stepsUnnamed =
    preparationSections.length === 1 && !preparationSections[0].title;

  return (
    <ThemeProvider theme={lightTheme}>
      <Box
        ref={ref}
        dir="rtl"
        lang="he"
        style={{ fontFamily: HEEBO_FONT_STACK }}
        sx={S.root}
      >
        {/* ── Header (page 1) ─────────────────────────────────────────── */}
        <Box sx={S.header}>
          <SiteLogo variant="desktop" alt={T.logoAlt} sx={S.logo} />
          <Box sx={S.headerRow}>
            {recipe.image && (
              <Box
                component="img"
                src={recipe.image.url}
                alt={recipe.image.alt}
                sx={S.photo}
              />
            )}
            <Box component="h1" sx={S.title}>
              {recipe.title}
            </Box>
          </Box>
        </Box>

        {/* ── Metadata run ───────────────────────────────────────────── */}
        {meta.length > 0 && (
          <Box sx={S.metaRun}>
            {meta.map((item, i) => (
              <Fragment key={item.label}>
                {i > 0 && <Box component="span" sx={S.metaSeparator}>{T.separator}</Box>}
                <Box component="span" sx={S.metaLabel}>{item.label}: </Box>
                <Box component="span" sx={S.metaValue}>{item.value}</Box>
              </Fragment>
            ))}
          </Box>
        )}

        {/* ── Tips ───────────────────────────────────────────────────── */}
        {recipe.tips.length > 0 && (
          <Box component="section" sx={S.section}>
            <SectionHeading title={T.tipsTitle} />
            <Box component="ul" sx={S.tipList}>
              {recipe.tips.map((tip, i) => (
                <Box component="li" key={i} sx={S.tipItem}>
                  {tip.text}
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* ── Special equipment ──────────────────────────────────────── */}
        {equipment.length > 0 && (
          <Box component="section" sx={S.section}>
            <SectionHeading title={T.equipmentTitle} />
            <Box sx={S.equipmentRun}>{equipment.join(T.separator)}</Box>
          </Box>
        )}

        {/* ── Ingredients ────────────────────────────────────────────── */}
        {ingredientSections.length > 0 && (
          <Box component="section" sx={S.section}>
            <SectionHeading title={T.ingredientsTitle} />
            {ingredientSections.map((section, si) => {
              const lines = section.ingredients.map((ing, ii) => {
                const prefix = [formatIngredientAmount(ing.amount), ing.unit]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <Box component="li" key={ii} sx={S.ingredientLine}>
                    {prefix && (
                      <Box component="span" sx={S.ingredientAmount}>
                        {prefix}
                      </Box>
                    )}
                    <Box component="span" sx={S.ingredientName}>
                      {ing.ingredientName}
                      {ing.note && (
                        <Box component="span" sx={S.ingredientNote}>
                          {T.noteSeparator}
                          {ing.note}
                        </Box>
                      )}
                    </Box>
                  </Box>
                );
              });

              return (
                <Box key={si} sx={S.ingredientGroup}>
                  <Box sx={S.keepWithStart}>
                    {!ingredientsUnnamed && section.title && (
                      <Box component="h3" sx={S.groupSubheading}>
                        {section.title}
                      </Box>
                    )}
                    <Box component="ul" sx={S.ingredientList}>
                      {lines.slice(0, 2)}
                    </Box>
                  </Box>
                  {lines.length > 2 && (
                    <Box component="ul" sx={S.ingredientList}>
                      {lines.slice(2)}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        )}

        {/* ── Preparation steps ──────────────────────────────────────── */}
        {preparationSections.length > 0 && (
          <Box component="section" sx={S.section}>
            <SectionHeading title={PreparationStepsSectionText.sectionTitle} />
            {preparationSections.map((section, si) => {
              const stepItems = section.steps.map((step, ii) => (
                <Box component="li" key={ii} sx={S.stepItem}>
                  <Box component="span" sx={S.stepNumber}>
                    {ii + 1}.
                  </Box>
                  <Box component="span" sx={S.stepText}>
                    {step.description}
                  </Box>
                </Box>
              ));

              return (
                <Box key={si} sx={S.stepGroup}>
                  <Box sx={S.keepWithStart}>
                    {!stepsUnnamed && section.title && (
                      <Box component="h3" sx={S.groupSubheading}>
                        {section.title}
                      </Box>
                    )}
                    <Box component="ol" sx={S.stepList}>
                      {stepItems.slice(0, 1)}
                    </Box>
                  </Box>
                  {stepItems.length > 1 && (
                    <Box component="ol" sx={S.stepList}>
                      {stepItems.slice(1)}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
}
