import { normalizeText } from '../../ingredient-match-candidate/services/normalizer';

/**
 * Ranking for /recipes/suggestions.
 *
 * Score bands — fixed, non-overlapping, so ingredient suggestions always
 * outrank recipe suggestions, and within ingredients the tiers below are
 * strictly ordered. This mirrors the "fixed non-overlapping bands" approach
 * already used for recipe scoring in the controller (see scoreRecipe there,
 * whose own output range — [2.0, 8.0] — sits entirely below FUZZY_MIN here).
 *
 * Tier  Score        Meaning
 *  1    100          Exact variant-name match
 *  2    90           Exact canonical ingredient-name match
 *  3    85           Canonical parent of an exact variant match (tier 1's companion)
 *  4a   70           Canonical/variant text starts with the query
 *  4b   40           Canonical/variant text contains the query
 *  4c   [10, 10.9]   Fuzzy (pg_trgm similarity on canonical_name), dampened
 *  5    [2.0, 8.0]   Recipe suggestions (scored separately, always lower)
 *
 * Why a variant-exact match also emits its canonical parent: the point of
 * this ranking is that typing an exact variant (e.g. "שאלוט") must not have
 * its own suggestion silently replaced by the canonical name ("בצל") — the
 * user gets both, with the exact term first and the broader canonical
 * search as an explicit second, clearly-labeled option.
 */
export const INGREDIENT_TIER = {
  VARIANT_EXACT: 100,
  CANONICAL_EXACT: 90,
  CANONICAL_PARENT: 85,
  PARTIAL_STARTS_WITH: 70,
  PARTIAL_CONTAINS: 40,
  FUZZY_MIN: 10,
} as const;

export type IngredientCatalogRow = {
  document_id: string;
  canonical_name: string;
  slug: string | null;
  variants: unknown;
  cn_score: number;
};

export type IngredientMatchType = 'variant' | 'canonical' | 'canonical-parent' | 'partial';

export type IngredientSuggestion = {
  type: 'ingredient';
  matchType: IngredientMatchType;
  label: string;
  subtitle: string;
  /** Exact text to filter recipe ingredient lines by — a variant string or the canonical name. */
  searchTerm: string;
  /** The ingredient_catalog_items.document_id this suggestion originates from — for dedup and grouping. */
  canonicalId: string;
  canonicalName: string;
  slug?: string;
  score: number;
};

export function parseVariants(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
  return [];
}

type MatchClassification =
  | { kind: 'canonical-exact'; matchedText: string }
  | { kind: 'variant-exact'; matchedText: string }
  | { kind: 'prefix'; matchedText: string }
  | { kind: 'contains'; matchedText: string }
  | { kind: 'fuzzy'; matchedText: string };

/**
 * Determines the single best match reason for one catalog row against the
 * normalized query — exact match beats prefix beats contains beats fuzzy,
 * and canonical is checked before variants at each level (arbitrary but
 * deterministic tie-break; a query can realistically only satisfy one of
 * these at the "exact" level for a given row).
 */
export function classifyIngredientMatch(row: IngredientCatalogRow, nq: string): MatchClassification {
  const nn = normalizeText(row.canonical_name);
  if (nn === nq) return { kind: 'canonical-exact', matchedText: row.canonical_name };

  const variants = parseVariants(row.variants);
  for (const v of variants) {
    if (normalizeText(v) === nq) return { kind: 'variant-exact', matchedText: v };
  }

  if (nn.startsWith(nq)) return { kind: 'prefix', matchedText: row.canonical_name };
  for (const v of variants) {
    if (normalizeText(v).startsWith(nq)) return { kind: 'prefix', matchedText: v };
  }

  if (nn.includes(nq)) return { kind: 'contains', matchedText: row.canonical_name };
  for (const v of variants) {
    if (normalizeText(v).includes(nq)) return { kind: 'contains', matchedText: v };
  }

  return { kind: 'fuzzy', matchedText: row.canonical_name };
}

/**
 * Builds the suggestion entries for one catalog row. Returns two entries
 * (exact variant + its canonical parent, in that order) only for an exact
 * variant match; every other case returns exactly one entry.
 */
export function buildIngredientSuggestions(row: IngredientCatalogRow, nq: string): IngredientSuggestion[] {
  const match = classifyIngredientMatch(row, nq);
  const base = {
    canonicalId: row.document_id,
    canonicalName: row.canonical_name,
    slug: row.slug ?? undefined,
  };

  switch (match.kind) {
    case 'variant-exact':
      return [
        {
          type: 'ingredient',
          matchType: 'variant',
          label: match.matchedText,
          subtitle: `מתכונים עם ${match.matchedText}`,
          searchTerm: match.matchedText,
          score: INGREDIENT_TIER.VARIANT_EXACT,
          ...base,
        },
        {
          type: 'ingredient',
          matchType: 'canonical-parent',
          label: row.canonical_name,
          subtitle: `חיפוש רחב יותר: מתכונים עם ${row.canonical_name}`,
          searchTerm: row.canonical_name,
          score: INGREDIENT_TIER.CANONICAL_PARENT,
          ...base,
        },
      ];

    case 'canonical-exact':
      return [
        {
          type: 'ingredient',
          matchType: 'canonical',
          label: row.canonical_name,
          subtitle: `מתכונים עם ${row.canonical_name}`,
          searchTerm: row.canonical_name,
          score: INGREDIENT_TIER.CANONICAL_EXACT,
          ...base,
        },
      ];

    case 'prefix':
      return [
        {
          type: 'ingredient',
          matchType: 'partial',
          label: match.matchedText,
          subtitle: `מתכונים עם ${match.matchedText}`,
          searchTerm: match.matchedText,
          score: INGREDIENT_TIER.PARTIAL_STARTS_WITH,
          ...base,
        },
      ];

    case 'contains':
      return [
        {
          type: 'ingredient',
          matchType: 'partial',
          label: match.matchedText,
          subtitle: `מתכונים עם ${match.matchedText}`,
          searchTerm: match.matchedText,
          score: INGREDIENT_TIER.PARTIAL_CONTAINS,
          ...base,
        },
      ];

    case 'fuzzy':
      return [
        {
          type: 'ingredient',
          matchType: 'partial',
          label: match.matchedText,
          subtitle: `מתכונים עם ${match.matchedText}`,
          searchTerm: match.matchedText,
          score: INGREDIENT_TIER.FUZZY_MIN + Math.min(Number(row.cn_score) || 0, 0.9),
          ...base,
        },
      ];
  }
}

/**
 * Drops duplicate ingredient suggestions — same catalog item + same
 * matchType. Defensive: buildIngredientSuggestions already emits at most one
 * entry per (row, matchType) pair, so this is a safety net against future
 * changes to the row source rather than a condition reachable today.
 */
export function dedupeIngredientSuggestions(entries: IngredientSuggestion[]): IngredientSuggestion[] {
  const seen = new Set<string>();
  return entries.filter((e) => {
    const key = `${e.canonicalId}:${e.matchType}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
