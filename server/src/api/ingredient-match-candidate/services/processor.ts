import type { Core } from '@strapi/strapi';
import { normalizeText } from './normalizer';
import { findMatch, findFuzzySuggestion } from './matcher';

const CANDIDATE_UID = 'api::ingredient-match-candidate.ingredient-match-candidate' as const;

export type ProcessResult = { created: number; skipped: number };

/**
 * Processes ingredient lines from a recipe and creates IngredientMatchCandidate
 * records for admin review.
 *
 * Rules:
 *   - If the normalized text already matches a catalog item (canonical or variant),
 *     skip it — it is already known and does not need review.
 *   - If a candidate for the same recipe + normalizedText already exists, skip it
 *     to prevent duplicates (guards against lifecycle firing more than once).
 *   - Only unmatched ingredients become candidates, with reviewStatus = 'pending'.
 */
export async function processRecipeIngredients(
  strapi: Core.Strapi,
  recipeDocumentId: string,
  rawLines: string[]
): Promise<ProcessResult> {
  const lines = rawLines.filter((l) => l.trim().length > 0);
  let created = 0;
  let skipped = 0;

  for (const rawText of lines) {
    const normalizedText = normalizeText(rawText);
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

    const suggestionDocumentId = await findFuzzySuggestion(strapi, normalizedText);

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

  return { created, skipped };
}
