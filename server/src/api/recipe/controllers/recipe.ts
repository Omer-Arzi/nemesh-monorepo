import { factories } from '@strapi/strapi';
import { processRecipeIngredientsByDocumentId } from '../../ingredient-match-candidate/services/processor';

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
        ingredients: { fields: ['ingredientName'] },
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
      (current as any).ingredients
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
        ingredients: { fields: ['ingredientName'] },
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

      const sharedIngredients = r.ingredients.filter((i: any) => {
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
    const { q } = ctx.query as { q?: string };

    if (!q?.trim()) {
      return ctx.badRequest('Missing required query parameter: q');
    }

    const knex = strapi.db.connection;

    // Use pg_trgm similarity to find matching document IDs.
    // Searches recipe title and ingredient names.
    // Threshold 0.3 — lower = more permissive, higher = stricter.
    const { rows } = await knex.raw<{ rows: { document_id: string }[] }>(
      `
      SELECT document_id FROM recipes
      WHERE published_at IS NOT NULL
        AND word_similarity(?, title) > 0.4

      UNION

      SELECT DISTINCT r.document_id FROM recipes r
      JOIN recipes_cmps rc
        ON rc.entity_id = r.id
        AND rc.field = 'ingredients'
      JOIN components_recipe_recipe_ingredients i
        ON i.id = rc.cmp_id
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

  async processIngredientCandidates(ctx) {
    const { documentId } = ctx.params as { documentId: string };
    const result = await processRecipeIngredientsByDocumentId(strapi, documentId);
    ctx.body = { data: result };
  },
}));
