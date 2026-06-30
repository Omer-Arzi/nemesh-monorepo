import { factories } from '@strapi/strapi';
import { processRecipeIngredientsByDocumentId } from '../../ingredient-match-candidate/services/processor';
import { normalizeText } from '../../ingredient-match-candidate/services/normalizer';

// ── Suggestion helpers (module-level, not Strapi-specific) ───────────────────

type RecipeRow    = { title: string; slug: string; score: number };
type IngredientRow = { document_id: string; canonical_name: string; slug: string | null; variants: unknown; cn_score: number };

async function fetchRecipesByTitle(
  knex: any,
  query: string,
  likePattern: string,
  limit: number
): Promise<RecipeRow[]> {
  try {
    const { rows } = (await knex.raw(
      `SELECT title, slug, word_similarity(lower(?), lower(title)) AS score
       FROM recipes
       WHERE published_at IS NOT NULL
         AND (lower(title) LIKE ? OR word_similarity(lower(?), lower(title)) > 0.25)
       LIMIT ?`,
      [query, likePattern, query, limit]
    )) as { rows: RecipeRow[] };
    return rows;
  } catch {
    const { rows } = (await knex.raw(
      `SELECT title, slug, 0.5 AS score
       FROM recipes
       WHERE published_at IS NOT NULL AND lower(title) LIKE ?
       LIMIT ?`,
      [likePattern, limit]
    )) as { rows: RecipeRow[] };
    return rows;
  }
}

// Finds recipes whose ingredient names contain the query (substring match only —
// no pg_trgm, so no false positives from trigram noise on short Hebrew words).
async function fetchRecipesByIngredient(
  knex: any,
  likePattern: string,
  limit: number
): Promise<RecipeRow[]> {
  const { rows } = (await knex.raw(
    `SELECT DISTINCT r.title, r.slug, 0.6 AS score
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
       AND lower(i.ingredient_name) LIKE ?
     LIMIT ?`,
    [likePattern, limit]
  )) as { rows: RecipeRow[] };
  return rows;
}

async function fetchRecipeCandidates(
  knex: any,
  query: string,
  likePattern: string,
  limit: number
): Promise<RecipeRow[]> {
  const [titleRows, ingRows] = await Promise.all([
    fetchRecipesByTitle(knex, query, likePattern, limit),
    fetchRecipesByIngredient(knex, likePattern, limit),
  ]);

  // Merge results; deduplicate by slug, keeping the higher score.
  // Title matches (0.9–2.0) naturally outrank ingredient-only matches (0.6).
  const bySlug = new Map<string, RecipeRow>();
  for (const r of [...titleRows, ...ingRows]) {
    const existing = bySlug.get(r.slug);
    if (!existing || Number(r.score) > Number(existing.score)) {
      bySlug.set(r.slug, r);
    }
  }
  return Array.from(bySlug.values());
}

async function fetchIngredientCandidates(
  knex: any,
  query: string,
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
           lower(canonical_name) LIKE ?
           OR word_similarity(lower(?), lower(canonical_name)) > 0.25
           OR (variants IS NOT NULL AND EXISTS (
             SELECT 1 FROM jsonb_array_elements_text(variants) AS v(value)
             WHERE lower(v.value) LIKE ?
                OR word_similarity(lower(?), lower(v.value)) > 0.25
           ))
         )
       LIMIT ?`,
      [query, likePattern, query, likePattern, query, limit]
    )) as { rows: IngredientRow[] };
    return rows;
  } catch {
    // pg_trgm unavailable — fall back to substring match only
    const { rows } = (await knex.raw(
      `SELECT document_id, canonical_name, slug, variants, 0.5 AS cn_score
       FROM ingredient_catalog_items
       WHERE approval_status = 'approved'
         AND (
           lower(canonical_name) LIKE ?
           OR (variants IS NOT NULL AND EXISTS (
             SELECT 1 FROM jsonb_array_elements_text(variants) AS v(value)
             WHERE lower(v.value) LIKE ?
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
  if (nt === nq) return 2.0;
  if (nt.startsWith(nq)) return Math.max(Number(row.score), 1.2);
  if (nt.includes(nq)) return Math.max(Number(row.score), 0.9);
  return Number(row.score);
}

function scoreIngredient(row: IngredientRow, nq: string): number {
  const nn = normalizeText(row.canonical_name);
  if (nn === nq) return 2.0;
  if (nn.startsWith(nq)) return Math.max(Number(row.cn_score), 1.3);
  if (nn.includes(nq)) return Math.max(Number(row.cn_score), 1.0);

  // Check variants for an exact/prefix/substring boost
  const variants: string[] = Array.isArray(row.variants)
    ? (row.variants as string[])
    : typeof row.variants === 'string'
      ? (() => { try { return JSON.parse(row.variants as string); } catch { return []; } })()
      : [];

  for (const v of variants) {
    const nv = normalizeText(v);
    if (nv === nq) return Math.max(Number(row.cn_score), 1.8);
    if (nv.startsWith(nq)) return Math.max(Number(row.cn_score), 1.1);
    if (nv.includes(nq)) return Math.max(Number(row.cn_score), 0.85);
  }

  return Number(row.cn_score);
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

    // Use pg_trgm similarity to find matching document IDs.
    // Searches recipe title and ingredient names.
    // Threshold 0.3 — lower = more permissive, higher = stricter.
    const { rows } = await knex.raw<{ rows: { document_id: string }[] }>(
      `
      SELECT document_id FROM recipes
      WHERE published_at IS NOT NULL
        AND word_similarity(?, title) > 0.4

      UNION

      SELECT DISTINCT r.document_id
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
        AND word_similarity(?, i.ingredient_name) > 0.4
      `,
      [q, q]
    );

    if (rows.length === 0) {
      ctx.body = { data: [] };
      return;
    }

    const documentIds = rows.map((r) => r.document_id);

    const results = await strapi.documents('api::recipe.recipe').findMany({
      filters: { documentId: { $in: documentIds } } as any,
      fields: ['title', 'slug', 'difficulty', 'prepTime', 'servings'],
      populate: {
        image: { fields: ['url', 'alternativeText', 'width', 'height'] },
        categories: { fields: ['name', 'slug'] },
      },
      status: 'published',
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
    const likePattern = `%${query.toLowerCase()}%`;
    const candidateLimit = Math.max(limit * 2, 15);
    const knex = strapi.db.connection;

    const [recipeRows, ingredientRows] = await Promise.all([
      fetchRecipeCandidates(knex, query, likePattern, candidateLimit),
      fetchIngredientCandidates(knex, query, likePattern, candidateLimit),
    ]);

    const nq = normalizeText(query);

    const recipes = recipeRows.map((r) => ({
      type: 'recipe' as const,
      label: r.title,
      subtitle: 'מתכון' as const,
      slug: r.slug,
      score: scoreRecipe(r, nq),
    }));

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
