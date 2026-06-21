import type { Core } from '@strapi/strapi';
import { normalizeText } from './normalizer';

const CATALOG_UID = 'api::ingredient-catalog-item.ingredient-catalog-item' as const;
const CATALOG_TABLE = 'ingredient_catalog_items' as const;

// Minimum pg_trgm similarity score to surface a fuzzy suggestion.
const FUZZY_SUGGESTION_THRESHOLD = 0.3;

export type MatchResult = {
  documentId: string;
  matchType: 'canonical' | 'variant';
};

/**
 * Tries to find an exact match for the given normalized text against the
 * approved ingredient catalog.
 *
 * Match priority:
 *   1. Exact match on canonicalName (normalized)
 *   2. Exact match on any variant (normalized)
 *
 * No fuzzy matching, no inference, no guessing.
 */
export async function findMatch(
  strapi: Core.Strapi,
  normalizedText: string
): Promise<MatchResult | null> {
  // Load all approved catalog items.
  // Limit is set high — this is an in-memory scan, acceptable for a small catalog.
  const items = await strapi.documents(CATALOG_UID).findMany({
    filters: { approvalStatus: 'approved' },
    limit: 500,
  });

  for (const item of items) {
    if (normalizeText(item.canonicalName) === normalizedText) {
      return { documentId: item.documentId, matchType: 'canonical' };
    }

    const variants = (Array.isArray(item.variants) ? item.variants : []) as string[];
    for (const variant of variants) {
      if (normalizeText(variant) === normalizedText) {
        return { documentId: item.documentId, matchType: 'variant' };
      }
    }
  }

  return null;
}

/**
 * Uses pg_trgm similarity to find the best-matching approved catalog item
 * for a given normalized text. Returns the document ID if the best match
 * exceeds FUZZY_SUGGESTION_THRESHOLD, otherwise null.
 *
 * Used to pre-populate suggestedIngredient on new candidates so admins
 * don't have to search manually during review.
 */
export async function findFuzzySuggestion(
  strapi: Core.Strapi,
  normalizedText: string
): Promise<string | null> {
  const knex = strapi.db.connection;

  const { rows } = await knex.raw<{ rows: { document_id: string }[] }>(
    `
    SELECT document_id
    FROM ${CATALOG_TABLE}
    WHERE approval_status = 'approved'
      AND similarity(canonical_name, ?) > ?
    ORDER BY similarity(canonical_name, ?) DESC
    LIMIT 1
    `,
    [normalizedText, FUZZY_SUGGESTION_THRESHOLD, normalizedText]
  );

  return rows[0]?.document_id ?? null;
}
