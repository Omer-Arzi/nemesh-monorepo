import { factories } from '@strapi/strapi';
import { processRecipeIngredientsByDocumentId } from '../../ingredient-match-candidate/services/processor';
import { normalizeText } from '../../ingredient-match-candidate/services/normalizer';

// ── Suggestion helpers (module-level, not Strapi-specific) ───────────────────

// Tier scores — fixed, non-overlapping bands so pg_trgm noise can never
// bridge tiers. Fuzzy scores (tiers 8–9) are dampened into sub-1.0 ranges
// that sit safely below every fixed-tier floor.
//
// Tier  Score   Meaning
//  1    9.0     Exact canonical or variant match
//  2    8.0     Exact recipe title match
//  3    7.0     Canonical or variant startsWith query
//  4    6.0     Recipe title startsWith query
//  5    5.0     Recipe title contains query
//  6    4.0     Canonical or variant contains query
//  7    3.0     Recipe ingredient contains query (no title match)
//  8    2.0–2.9 Fuzzy recipe title (pg_trgm, capped to leave room below tier 7)
//  9    1.0–1.9 Fuzzy canonical/variant (pg_trgm)

type RecipeRow = { title: string; slug: string; score: number; matched_ingredient?: string };
type IngredientRow = { document_id: string; canonical_name: string; slug: string | null; variants: unknown; cn_score: number };

function parseVariants(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return []; }
  }
  return [];
}

// SQL snippets that apply Hebrew final-letter normalisation to a COLUMN so
// ILIKE can match a mid-word query ("שומ") against a stored final form ("שום").
// The query / likePattern are pre-normalised in JS via normalizeText(), so no
// TRANSLATE is needed on the parameter side.
const TR_TITLE = `TRANSLATE(lower(title), 'ךםןףץ', 'כמנפצ')`;
const TR_ING   = `TRANSLATE(lower(i.ingredient_name), 'ךםןףץ', 'כמנפצ')`;
const TR_CN    = `TRANSLATE(lower(canonical_name), 'ךםןףץ', 'כמנפצ')`;
const TR_VAR   = `TRANSLATE(lower(v.value), 'ךםןףץ', 'כמנפצ')`;

// rawQuery — query as typed, for pg_trgm (which works on original text)
// likePattern — '%' + normalizeText(rawQuery) + '%', for ILIKE

async function fetchRecipesByTitle(
  knex: any,
  rawQuery: string,
  likePattern: string,
  limit: number
): Promise<RecipeRow[]> {
  try {
    const { rows } = (await knex.raw(
      `SELECT title, slug, word_similarity(lower(?), lower(title)) AS score
       FROM recipes
       WHERE published_at IS NOT NULL
         AND (${TR_TITLE} LIKE ? OR word_similarity(lower(?), lower(title)) > 0.25)
       LIMIT ?`,
      [rawQuery, likePattern, rawQuery, limit]
    )) as { rows: RecipeRow[] };
    return rows;
  } catch {
    // pg_trgm unavailable — ILIKE only
    const { rows } = (await knex.raw(
      `SELECT title, slug, 0.5 AS score
       FROM recipes
       WHERE published_at IS NOT NULL AND ${TR_TITLE} LIKE ?
       LIMIT ?`,
      [likePattern, limit]
    )) as { rows: RecipeRow[] };
    return rows;
  }
}

// Returns one row per recipe with the first matching ingredient name.
// TRANSLATE normalises stored final letters so "%שומ%" matches "שום".
// Pure ILIKE — no pg_trgm — avoids false positives on short queries.
async function fetchRecipesByIngredient(
  knex: any,
  likePattern: string,
  limit: number
): Promise<RecipeRow[]> {
  const { rows } = (await knex.raw(
    `SELECT r.title, r.slug, 0.6 AS score, MIN(i.ingredient_name) AS matched_ingredient
     FROM recipes r
     INNER JOIN recipes_cmps rc
       ON rc.entity_id = r.id AND rc.field = 'ingredientSections'
     INNER JOIN components_recipe_ingredient_sections s
       ON s.id = rc.cmp_id
     INNER JOIN components_recipe_ingredient_sections_cmps sic
       ON sic.entity_id = s.id AND sic.field = 'ingredients'
     INNER JOIN components_recipe_recipe_ingredients i
       ON i.id = sic.cmp_id
     WHERE r.published_at IS NOT NULL
       AND ${TR_ING} LIKE ?
     GROUP BY r.title, r.slug
     LIMIT ?`,
    [likePattern, limit]
  )) as { rows: RecipeRow[] };
  return rows;
}

async function fetchRecipeCandidates(
  knex: any,
  rawQuery: string,
  likePattern: string,
  limit: number
): Promise<RecipeRow[]> {
  const [titleRows, ingRows] = await Promise.all([
    fetchRecipesByTitle(knex, rawQuery, likePattern, limit),
    fetchRecipesByIngredient(knex, likePattern, limit),
  ]);

  // Title rows take precedence. Ingredient rows contribute matched_ingredient
  // for annotation, or add the entry when the recipe was ingredient-only found.
  const bySlug = new Map<string, RecipeRow>();
  for (const r of titleRows) {
    bySlug.set(r.slug, r);
  }
  for (const r of ingRows) {
    const existing = bySlug.get(r.slug);
    if (existing) {
      bySlug.set(r.slug, { ...existing, matched_ingredient: r.matched_ingredient });
    } else {
      bySlug.set(r.slug, r);
    }
  }
  return Array.from(bySlug.values());
}

async function fetchIngredientCandidates(
  knex: any,
  rawQuery: string,
  likePattern: string,
  limit: number
): Promise<IngredientRow[]> {
  try {
    const { rows } = (await knex.raw(
      `SELECT document_id, canonical_name, slug, variants,
              word_similarity(lower(?), lower(canonical_name)) AS cn_score
       FROM ingredient_catalog_items
       WHERE approval_status = 'approved'
         AND (
           ${TR_CN} LIKE ?
           OR word_similarity(lower(?), lower(canonical_name)) > 0.25
           OR (variants IS NOT NULL AND EXISTS (
             SELECT 1 FROM jsonb_array_elements_text(variants) AS v(value)
             WHERE ${TR_VAR} LIKE ?
                OR word_similarity(lower(?), lower(v.value)) > 0.25
           ))
         )
       LIMIT ?`,
      [rawQuery, likePattern, rawQuery, likePattern, rawQuery, limit]
    )) as { rows: IngredientRow[] };
    return rows;
  } catch {
    // pg_trgm unavailable — fall back to substring match only
    const { rows } = (await knex.raw(
      `SELECT document_id, canonical_name, slug, variants, 0.5 AS cn_score
       FROM ingredient_catalog_items
       WHERE approval_status = 'approved'
         AND (
           ${TR_CN} LIKE ?
           OR (variants IS NOT NULL AND EXISTS (
             SELECT 1 FROM jsonb_array_elements_text(variants) AS v(value)
             WHERE ${TR_VAR} LIKE ?
           ))
         )
       LIMIT ?`,
      [likePattern, likePattern, limit]
    )) as { rows: IngredientRow[] };
    return rows;
  }
}

function scoreRecipe(row: RecipeRow, nq: string): number {
  const nt = normalizeText(row.title);
  if (nt === nq) return 8.0;                                   // tier 2
  if (nt.startsWith(nq)) return 6.0;                           // tier 4
  if (nt.includes(nq)) return 5.0;                             // tier 5
  if (row.matched_ingredient) return 3.0;                      // tier 7
  return 2.0 + Math.min(Number(row.score), 0.9);              // tier 8 (fuzzy)
}

function scoreIngredient(row: IngredientRow, nq: string): number {
  const nn = normalizeText(row.canonical_name);
  if (nn === nq) return 9.0;                                   // tier 1
  if (nn.startsWith(nq)) return 7.0;                          // tier 3
  if (nn.includes(nq)) return 4.0;                            // tier 6

  for (const v of parseVariants(row.variants)) {
    const nv = normalizeText(v);
    if (nv === nq) return 9.0;                                 // tier 1
    if (nv.startsWith(nq)) return 7.0;                        // tier 3
    if (nv.includes(nq)) return 4.0;                          // tier 6
  }

  return 1.0 + Math.min(Number(row.cn_score), 0.9);           // tier 9 (fuzzy)
}

export default factories.createCoreController('api::recipe.recipe', ({ strapi }) => ({
  async related(ctx) {
    const { slug } = ctx.params as { slug: string };

    // Load current recipe — need its categories, tags, and ingredients for scoring.
    const [current] = await strapi.documents('api::recipe.recipe').findMany({
      filters: { slug: { $eq: slug } } as any,
      fields: ['documentId', 'updatedAt'],
      populate: {
        categories: { fields: ['documentId'] },
        tags: { fields: ['documentId'] },
        ingredientSections: { populate: { ingredients: { fields: ['ingredientName'] } } },
      },
      status: 'published',
      limit: 1,
    });

    if (!current || (current as any).categories.length === 0) {
      ctx.body = { data: [] };
      return;
    }

    const currentCategoryIds = new Set<string>(
      (current as any).categories.map((c: any) => c.documentId)
    );
    const currentTagIds = new Set<string>(
      (current as any).tags.map((t: any) => t.documentId)
    );
    const currentIngredientNames = new Set<string>(
      ((current as any).ingredientSections ?? [])
        .flatMap((sec: any) => sec.ingredients ?? [])
        .map((i: any) => i.ingredientName?.toLowerCase().trim())
        .filter(Boolean)
    );

    // Load all other published recipes with categories, tags, and ingredients.
    const all = await strapi.documents('api::recipe.recipe').findMany({
      filters: { documentId: { $ne: (current as any).documentId } } as any,
      fields: ['documentId', 'title', 'slug', 'difficulty', 'prepTime', 'servings', 'updatedAt'],
      populate: {
        image: { fields: ['url', 'alternativeText', 'width', 'height'] },
        categories: { fields: ['documentId', 'name', 'slug'] },
        tags: { fields: ['documentId', 'name', 'slug'] },
        ingredientSections: { populate: { ingredients: { fields: ['ingredientName'] } } },
      },
      status: 'published',
      limit: 500,
    });

    // Keep only candidates that share at least one category with the current recipe.
    const candidates = (all as any[]).filter((r) =>
      r.categories.some((c: any) => currentCategoryIds.has(c.documentId))
    );

    // Score each candidate.
    // Weights: sharedCategories × 10, sharedTags × 3, sharedIngredients × 1
    const scored = candidates.map((r) => {
      const sharedCategories = r.categories.filter((c: any) =>
        currentCategoryIds.has(c.documentId)
      ).length;

      const sharedTags = r.tags.filter((t: any) =>
        currentTagIds.has(t.documentId)
      ).length;

      const sharedIngredients = (r.ingredientSections ?? [])
        .flatMap((sec: any) => sec.ingredients ?? [])
        .filter((i: any) => {
          const name = i.ingredientName?.toLowerCase().trim();
          return name && currentIngredientNames.has(name);
        }).length;

      return {
        r,
        score: sharedCategories * 10 + sharedTags * 3 + sharedIngredients,
        sharedCategories,
        sharedTags,
        sharedIngredients,
      };
    });

    // Sort deterministically.
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.sharedCategories !== a.sharedCategories) return b.sharedCategories - a.sharedCategories;
      if (b.sharedTags !== a.sharedTags) return b.sharedTags - a.sharedTags;
      if (b.sharedIngredients !== a.sharedIngredients) return b.sharedIngredients - a.sharedIngredients;
      const da = new Date(a.r.updatedAt).getTime();
      const db = new Date(b.r.updatedAt).getTime();
      if (db !== da) return db - da;
      return a.r.documentId < b.r.documentId ? -1 : 1;
    });

    ctx.body = { data: scored.slice(0, 4).map(({ r }) => r) };
  },

  async random(ctx) {
    const knex = strapi.db.connection;

    // COUNT is cheap — avoids loading all recipes into memory.
    const { rows: countRows } = await knex.raw<{ rows: [{ count: string }] }>(
      `SELECT COUNT(*) AS count FROM recipes WHERE published_at IS NOT NULL`
    );
    const total = parseInt(countRows[0].count, 10);

    if (total === 0) {
      ctx.body = { data: null };
      return;
    }

    const randomOffset = Math.floor(Math.random() * total);

    const { rows } = await knex.raw<{ rows: { slug: string; title: string }[] }>(
      `SELECT slug, title FROM recipes WHERE published_at IS NOT NULL LIMIT 1 OFFSET ?`,
      [randomOffset]
    );

    ctx.body = { data: rows[0] ?? null };
  },

  async search(ctx) {
    const { q, ingredient } = ctx.query as { q?: string; ingredient?: string };

    const knex = strapi.db.connection;

    // Ingredient-intent mode: strict ILIKE match on ingredient names only.
    // No fuzzy matching — avoids pg_trgm false positives on short Hebrew words.
    // Used when the user clicks an ingredient suggestion rather than typing a free query.
    if (ingredient?.trim()) {
      const likePattern = `%${ingredient.trim().toLowerCase()}%`;
      const { rows: ingRows } = (await knex.raw(
        `SELECT DISTINCT r.document_id
         FROM recipes r
         INNER JOIN recipes_cmps rc
           ON rc.entity_id = r.id AND rc.field = 'ingredientSections'
         INNER JOIN components_recipe_ingredient_sections s
           ON s.id = rc.cmp_id
         INNER JOIN components_recipe_ingredient_sections_cmps sic
           ON sic.entity_id = s.id AND sic.field = 'ingredients'
         INNER JOIN components_recipe_recipe_ingredients i
           ON i.id = sic.cmp_id
         WHERE r.published_at IS NOT NULL
           AND lower(i.ingredient_name) LIKE ?`,
        [likePattern]
      )) as { rows: { document_id: string }[] };

      if (ingRows.length === 0) {
        ctx.body = { data: [] };
        return;
      }

      const results = await strapi.documents('api::recipe.recipe').findMany({
        filters: { documentId: { $in: ingRows.map((r) => r.document_id) } } as any,
        fields: ['title', 'slug', 'difficulty', 'prepTime', 'servings'],
        populate: {
          image: { fields: ['url', 'alternativeText', 'width', 'height'] },
          categories: { fields: ['name', 'slug'] },
        },
        status: 'published',
      });

      ctx.body = { data: results };
      return;
    }

    if (!q?.trim()) {
      return ctx.badRequest('Missing required query parameter: q');
    }

    const rawQuery = q.trim();
    const nq = normalizeText(rawQuery);
    const startsPattern = `${nq}%`;
    const likePattern = `%${nq}%`;

    // Shared join fragment for ingredient queries (alias: r → recipes, i → recipe_ingredients)
    const ingJoin = `
      FROM recipes r
      INNER JOIN recipes_cmps rc
        ON rc.entity_id = r.id AND rc.field = 'ingredientSections'
      INNER JOIN components_recipe_ingredient_sections s
        ON s.id = rc.cmp_id
      INNER JOIN components_recipe_ingredient_sections_cmps sic
        ON sic.entity_id = s.id AND sic.field = 'ingredients'
      INNER JOIN components_recipe_recipe_ingredients i
        ON i.id = sic.cmp_id
      WHERE r.published_at IS NOT NULL`;

    type ScoreRow = { document_id: string; score: number };

    // Tiered ILIKE scoring for title (100 exact · 80 startsWith · 60 contains)
    // TRANSLATE normalises stored Hebrew final letters to match a mid-word query.
    // Test: "שומ" → nq "שומ" · TR_TITLE("שום") = "שומ" → exact (100)
    const [titleResult, ingResult] = await Promise.all([
      knex.raw(
        `SELECT document_id,
           CASE
             WHEN ${TR_TITLE} = ?      THEN 100
             WHEN ${TR_TITLE} LIKE ?   THEN 80
             ELSE                           60
           END AS score
         FROM recipes
         WHERE published_at IS NOT NULL AND ${TR_TITLE} LIKE ?`,
        [nq, startsPattern, likePattern]
      ),
      knex.raw(
        // Tiered ILIKE scoring for ingredient names (90 exact · 70 startsWith · 50 contains)
        // Group so each recipe contributes only its best-matching ingredient score.
        // Test: "שומ" → sesame ("שומשום") startsWith (70) · garlic ("שום") exact (90)
        // Test: "סוכר" → hummus excluded (no sugar ingredient)
        `SELECT r.document_id,
           MAX(CASE
             WHEN ${TR_ING} = ?      THEN 90
             WHEN ${TR_ING} LIKE ?   THEN 70
             ELSE                         50
           END) AS score
         ${ingJoin}
           AND ${TR_ING} LIKE ?
         GROUP BY r.document_id`,
        [nq, startsPattern, likePattern]
      ),
    ]);

    const scoreMap = new Map<string, number>();
    for (const row of [
      ...(titleResult as { rows: ScoreRow[] }).rows,
      ...(ingResult  as { rows: ScoreRow[] }).rows,
    ]) {
      const prev = scoreMap.get(row.document_id) ?? 0;
      if (Number(row.score) > prev) scoreMap.set(row.document_id, Number(row.score));
    }

    // Optional pg_trgm fuzzy layer — only for queries ≥ 4 chars to avoid noise.
    // Scores capped at 39 (title) / 34 (ingredient) so they never outrank ILIKE tiers.
    if (nq.length >= 4) {
      try {
        const [ft, fi] = await Promise.all([
          knex.raw(
            `SELECT document_id,
               LEAST(ROUND(word_similarity(lower(?), lower(title))::numeric * 40, 1), 39) AS score
             FROM recipes
             WHERE published_at IS NOT NULL
               AND word_similarity(lower(?), lower(title)) > 0.3`,
            [rawQuery, rawQuery]
          ),
          knex.raw(
            `SELECT r.document_id,
               LEAST(ROUND(MAX(word_similarity(lower(?), lower(i.ingredient_name)))::numeric * 35, 1), 34) AS score
             ${ingJoin}
               AND word_similarity(lower(?), lower(i.ingredient_name)) > 0.3
             GROUP BY r.document_id`,
            [rawQuery, rawQuery]
          ),
        ]);
        for (const row of [
          ...(ft as { rows: ScoreRow[] }).rows,
          ...(fi as { rows: ScoreRow[] }).rows,
        ]) {
          const prev = scoreMap.get(row.document_id) ?? 0;
          if (Number(row.score) > prev) scoreMap.set(row.document_id, Number(row.score));
        }
      } catch {
        // pg_trgm unavailable — proceed with ILIKE-only results
      }
    }

    if (scoreMap.size === 0) {
      ctx.body = { data: [] };
      return;
    }

    const sortedIds = [...scoreMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id);

    const results = await strapi.documents('api::recipe.recipe').findMany({
      filters: { documentId: { $in: sortedIds } } as any,
      fields: ['title', 'slug', 'difficulty', 'prepTime', 'servings'],
      populate: {
        image: { fields: ['url', 'alternativeText', 'width', 'height'] },
        categories: { fields: ['name', 'slug'] },
      },
      status: 'published',
    });

    // Strapi findMany does not preserve $in order — re-sort to match score ranking.
    const idToRank = new Map(sortedIds.map((id, i) => [id, i]));
    (results as any[]).sort((a, b) => {
      const ai = idToRank.get(a.documentId) ?? Infinity;
      const bi = idToRank.get(b.documentId) ?? Infinity;
      return ai - bi;
    });

    ctx.body = { data: results };
  },

  async suggestions(ctx) {
    const { q, limit: limitRaw } = ctx.query as { q?: string; limit?: string };

    const query = (q ?? '').trim();
    if (query.length < 2) {
      ctx.body = { data: [] };
      return;
    }

    const limit = Math.min(parseInt(limitRaw ?? '10', 10) || 10, 10);
    const nq = normalizeText(query);
    const likePattern = `%${nq}%`;
    const candidateLimit = Math.max(limit * 2, 15);
    const knex = strapi.db.connection;

    const [recipeRows, ingredientRows] = await Promise.all([
      fetchRecipeCandidates(knex, query, likePattern, candidateLimit),
      fetchIngredientCandidates(knex, query, likePattern, candidateLimit),
    ]);

    const recipes = recipeRows.map((r) => {
      const score = scoreRecipe(r, nq);
      // Show which ingredient triggered the match only when the recipe did not
      // match by title (tier 7 = 3.0; anything >= 5.0 is a title match).
      const subtitle =
        r.matched_ingredient && score < 5.0
          ? `מתכון · מכיל ${r.matched_ingredient}`
          : 'מתכון';
      return { type: 'recipe' as const, label: r.title, subtitle, slug: r.slug, score };
    });

    const ingredients = ingredientRows.map((i) => ({
      type: 'ingredient' as const,
      label: i.canonical_name,
      subtitle: `מתכונים עם ${i.canonical_name}`,
      canonicalName: i.canonical_name,
      slug: i.slug ?? undefined,
      score: scoreIngredient(i, nq),
    }));

    const merged = [...recipes, ...ingredients]
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    ctx.body = { data: merged };
  },

  async processIngredientCandidates(ctx) {
    const { documentId } = ctx.params as { documentId: string };
    const result = await processRecipeIngredientsByDocumentId(strapi, documentId);
    ctx.body = { data: result };
  },
}));
