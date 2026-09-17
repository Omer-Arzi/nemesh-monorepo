"use client";

import { useEffect, useMemo, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import Box from "@mui/material/Box";
import { RecipePageText } from "./consts";
import { Section, LoadingState, ErrorState } from "@/components/shared";
import {
  RecipeHero,
  RecipeDetailLayout,
  StickyIngredientsSidebar,
  PreparationStepsSection,
  RecipeTipsSection,
  RecipeSpecialEquipmentSection,
  RelatedRecipes,
  CookingModeToolbar,
  PrintRecipeButton,
  RecipePrintDocument,
  buildRecipePrintPageStyle,
  useMobileRecipePrint,
  useAmbientRecipePrint,
} from "@/components/domain";
import { useRecipe, useRelatedRecipes } from "@/features/recipe/hooks";
import { useCookingMode } from "@/features/cooking-mode";
import { useIsMobileBrowser } from "@/hooks/useIsMobileBrowser";
import { analytics } from "@/lib/analytics";
import { getSiteUrl } from "@/lib/seo/seoConfig";
import { ROUTES } from "@/constants";
import type { Recipe, RecipeSummary } from "@/types/domain";

// ── RecipeContent ────────────────────────────────────────────────────────────
// Extracted so useCookingMode is ALWAYS called with a real recipe.id (never "").
// All cooking-mode state lives here and flows down via explicit props.

type ContentProps = {
  recipe: Recipe;
  relatedRecipes: RecipeSummary[];
};

function RecipeContent({ recipe, relatedRecipes }: ContentProps) {
  const totalIngredients = recipe.ingredientSections.reduce(
    (n, s) => n + s.ingredients.length,
    0,
  );
  const totalSteps = recipe.preparationSections.reduce(
    (n, s) => n + s.steps.length,
    0,
  );

  const cookingMode = useCookingMode(recipe.id, totalIngredients, totalSteps);

  // Dedicated print document (hidden subtree, cloned by react-to-print into
  // its own iframe). Renders from `recipe` — no extra fetch, no live-page
  // restyle. The URL + footer strings are interpolated into `pageStyle` here.
  const printRef = useRef<HTMLDivElement>(null);
  const pageStyle = useMemo(
    () => buildRecipePrintPageStyle(`${getSiteUrl()}${ROUTES.RECIPE(recipe.slug)}`),
    [recipe.slug],
  );

  // Desktop path — unchanged. react-to-print's off-screen iframe.
  const handleDesktopPrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: recipe.title,
    pageStyle,
    preserveAfterPrint: true,
  });

  // Mobile path — iOS Safari / Android print the top-level page, not the
  // iframe, so react-to-print would print the whole live site. This portals
  // the print document into <body> and prints that instead.
  const isMobileBrowser = useIsMobileBrowser();
  const { startPrint: handleMobilePrint, printPortal } = useMobileRecipePrint(
    recipe,
    pageStyle,
  );

  const handlePrint = isMobileBrowser ? handleMobilePrint : handleDesktopPrint;

  // Ambient print path — Ctrl+P / File>Print / a mobile browser's own Print
  // menu item, none of which run `handlePrint` at all. See the hook's own
  // doc comment for why this can never affect the button paths above.
  useAmbientRecipePrint(printRef);

  // Track recipe view once on mount.
  useEffect(() => {
    analytics.trackRecipeView({
      recipe_id: recipe.id,
      recipe_name: recipe.title,
      recipe_slug: recipe.slug,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Track cooking mode start/exit. The ref skips the initial false state.
  const cookingModeMountedRef = useRef(false);
  useEffect(() => {
    if (!cookingModeMountedRef.current) {
      cookingModeMountedRef.current = true;
      return;
    }
    if (cookingMode.isActive) {
      analytics.trackCookingModeStart({ recipe_id: recipe.id, recipe_name: recipe.title });
    } else {
      analytics.trackCookingModeExit({ recipe_id: recipe.id, recipe_name: recipe.title });
    }
  }, [cookingMode.isActive]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <RecipeHero
        title={recipe.title}
        image={recipe.image}
        description={recipe.description}
        categories={recipe.categories}
        prepTime={recipe.prepTime}
        totalTime={recipe.totalTime}
        servings={recipe.servings}
        difficulty={recipe.difficulty}
        action={<PrintRecipeButton onClick={handlePrint} />}
      />

      {/* `@page` size/margin/footer rules — needed by the ambient path too
          (Ctrl+P prints this document directly, not through react-to-print's
          iframe, which gets its own copy of `pageStyle` from the `useReactToPrint`
          option instead). */}
      <style>{pageStyle}</style>

      {/* Hidden print subtree — offscreen on screen (not display:none, which
          can break react-to-print cloning). Targeted by `printRef` on
          desktop. Under print, `position: static` / `width/height: auto` /
          `overflow: visible` let this box lay out normally at its natural
          size instead of staying pinned to 0×0. For the ambient path
          (`useAmbientRecipePrint`), every OTHER sibling up to `<body>` gets
          `display: none` on `beforeprint`, so this becomes the only content
          left in flow and naturally lands at the top of the page — no
          explicit positioning needed here for that. */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          width: 0,
          height: 0,
          overflow: "hidden",
          "@media print": {
            position: "static",
            width: "auto",
            height: "auto",
            overflow: "visible",
          },
        }}
      >
        <RecipePrintDocument ref={printRef} recipe={recipe} />
      </Box>

      {/* Mobile print path renders its own copy into a <body> portal while
          the dialog is open (null otherwise). */}
      {printPortal}

      <RecipeTipsSection tips={recipe.tips} />

      <RecipeSpecialEquipmentSection equipment={recipe.specialEquipment} />

      <CookingModeToolbar
        isActive={cookingMode.isActive}
        onToggle={cookingMode.toggleActive}
        onReset={cookingMode.reset}
        ingredientProgress={cookingMode.ingredientProgress}
        stepProgress={cookingMode.stepProgress}
      />

      <RecipeDetailLayout
        sidebar={
          <StickyIngredientsSidebar
            ingredientSections={recipe.ingredientSections}
            cookingMode={{
              isActive: cookingMode.isActive,
              checkedKeys: cookingMode.checkedIngredientKeys,
              onToggle: cookingMode.toggleIngredient,
            }}
          />
        }
      >
        <Section sx={{ px: { xs: 2, md: 4 } }}>
          <PreparationStepsSection
            preparationSections={recipe.preparationSections}
            cookingMode={{
              isActive: cookingMode.isActive,
              checkedKeys: cookingMode.checkedStepKeys,
              onToggle: cookingMode.toggleStep,
            }}
          />
        </Section>
      </RecipeDetailLayout>

      <RelatedRecipes recipes={relatedRecipes} />
    </>
  );
}

// ── RecipePageClient ─────────────────────────────────────────────────────────

type Props = {
  slug: string;
  /** Fetched server-side in page.tsx; seeds `useRecipe` so the very first
   *  render (including the server-rendered HTML) shows the real recipe. */
  initialRecipe: Recipe;
  /** Same idea, for the related-recipes rail. */
  initialRelatedRecipes: RecipeSummary[];
};

export default function RecipePageClient({ slug, initialRecipe, initialRelatedRecipes }: Props) {
  const { data: recipe, isLoading, isError, refetch } = useRecipe(slug, initialRecipe);
  const { data: relatedRecipes = [] } = useRelatedRecipes(slug, initialRelatedRecipes);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading) {
    return <LoadingState label={RecipePageText.loading} minHeight={400} />;
  }

  if (isError) {
    return (
      <ErrorState
        description={RecipePageText.errorLoad}
        onRetry={() => refetch()}
      />
    );
  }

  if (!recipe) {
    return <ErrorState title={RecipePageText.errorNotFound} />;
  }

  return <RecipeContent recipe={recipe} relatedRecipes={relatedRecipes} />;
}
