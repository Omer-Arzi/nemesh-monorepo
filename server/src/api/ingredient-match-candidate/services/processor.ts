import type { Core } from '@strapi/strapi';
import { normalizeText } from './normalizer';
import { findMatch, findFuzzySuggestion } from './matcher';

const CANDIDATE_UID = 'api::ingredient-match-candidate.ingredient-match-candidate' as const;

export type ProcessResult = { created: number; skipped: number; invalidated: number };

/** One ingredient line as seen by the matching pipeline. */
export type IngredientOccurrence = {
  ingredientName: string;
  /**
   * True when this occurrence has a preparationRecipe set — it represents a
   * prepared sub-recipe, not a raw ingredient, and must never enter catalog
   * matching (see server/CLAUDE.md: keep canonical ingredient data and
   * contextual recipe data separate).
   */
  hasPreparationRecipe: boolean;
};

/**
 * Removes any still-pending candidate for (recipe, normalizedText).
 *
 * Scope is intentionally narrow: only 'pending' candidates for this exact
 * recipe + normalized ingredient text are eligible. Approved/rejected
 * candidates are left untouched — they represent a decision already made,
 * and this function has no way to distinguish "the same occurrence" from
 * "a different ingredient that happens to normalize the same way" once a
 * decision has been recorded, so it never touches those rows.
 */
async function invalidatePendingCandidate(
  strapi: Core.Strapi,
  recipeDocumentId: string,
  normalizedText: string
): Promise<boolean> {
  const pending = await strapi.documents(CANDIDATE_UID).findFirst({
    filters: {
      recipe: { documentId: recipeDocumentId },
      normalizedText,
      reviewStatus: 'pending',
    },
  });

  if (!pending) return false;

  await strapi.documents(CANDIDATE_UID).delete({ documentId: pending.documentId });
  strapi.log.info(
    `[ingredient-processor] Invalidated pending candidate for "${normalizedText}" (now backed by a preparationRecipe)`
  );
  return true;
}

/**
 * Processes ingredient occurrences from a recipe and creates IngredientMatchCandidate
 * records for admin review.
 *
 * Rules:
 *   - An occurrence with a preparationRecipe set is a prepared sub-recipe reference,
 *     not a raw ingredient — it never enters catalog matching, and any pending
 *     candidate that already exists for it (from before the recipe was linked) is
 *     invalidated. This is the only case handled specially; everything else is
 *     unchanged from the original catalog-matching pipeline.
 *   - If the normalized text already matches a catalog item (canonical or variant),
 *     skip it — it is already known and does not need review.
 *   - If a candidate for the same recipe + normalizedText already exists, skip it
 *     to prevent duplicates (guards against lifecycle firing more than once).
 *   - Only unmatched ingredients become candidates, with reviewStatus = 'pending'.
 */
export async function processRecipeIngredients(
  strapi: Core.Strapi,
  recipeDocumentId: string,
  occurrences: IngredientOccurrence[]
): Promise<ProcessResult> {
  let created = 0;
  let skipped = 0;
  let invalidated = 0;

  for (const occurrence of occurrences) {
    const rawText = occurrence.ingredientName.trim();
    if (!rawText) continue;

    const normalizedText = normalizeText(rawText);

    if (occurrence.hasPreparationRecipe) {
      if (await invalidatePendingCandidate(strapi, recipeDocumentId, normalizedText)) {
        invalidated++;
      } else {
        skipped++;
      }
      continue;
    }

    const match = await findMatch(strapi, normalizedText);

    if (match) {
      strapi.log.info(
        `[ingredient-processor] "${rawText}" already in catalog (${match.matchType}) — skipping candidate`
      );
      skipped++;
      continue;
    }

    const existing = await strapi.documents(CANDIDATE_UID).findFirst({
      filters: { recipe: { documentId: recipeDocumentId }, normalizedText },
    });

    if (existing) {
      strapi.log.info(
        `[ingredient-processor] Candidate already exists for "${rawText}" — skipping duplicate`
      );
      skipped++;
      continue;
    }

    const suggestionDocumentId = await findFuzzySuggestion(strapi, normalizedText).catch((err) => {
      strapi.log.error('[ingredient-processor] findFuzzySuggestion failed, continuing without suggestion:', err);
      return null;
    });

    await strapi.documents(CANDIDATE_UID).create({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: {
        ingredientName: rawText,
        recipe: recipeDocumentId,
        normalizedText,
        matchType: 'none',
        reviewStatus: 'pending',
        ...(suggestionDocumentId
          ? { suggestedIngredient: suggestionDocumentId }
          : {}),
      } as any,
    });

    strapi.log.info(`[ingredient-processor] Created candidate for "${rawText}"`);
    created++;
  }

  return { created, skipped, invalidated };
}

/**
 * Convenience wrapper: fetches a recipe's ingredients then calls processRecipeIngredients.
 * Used by both the recipe afterCreate/afterUpdate lifecycle and the
 * processIngredientCandidates controller.
 */
export async function processRecipeIngredientsByDocumentId(
  strapi: Core.Strapi,
  recipeDocumentId: string
): Promise<ProcessResult> {
  const recipe = await strapi.documents('api::recipe.recipe').findOne({
    documentId: recipeDocumentId,
    populate: {
      ingredientSections: {
        populate: {
          ingredients: {
            fields: ['ingredientName'],
            populate: { preparationRecipe: { fields: ['documentId'] } },
          },
        },
      },
    },
  });

  const occurrences: IngredientOccurrence[] = ((recipe as any)?.ingredientSections ?? [])
    .flatMap((sec: any) => sec.ingredients ?? [])
    .map((ing: any) => ({
      ingredientName: ing.ingredientName as string | undefined,
      hasPreparationRecipe: Boolean(ing.preparationRecipe),
    }))
    .filter(
      (occ: { ingredientName: string | undefined; hasPreparationRecipe: boolean }): occ is IngredientOccurrence =>
        Boolean(occ.ingredientName)
    );

  return processRecipeIngredients(strapi, recipeDocumentId, occurrences);
}
