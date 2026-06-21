import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::recipe.recipe', ({ strapi }) => ({
  async related(ctx) {
    const { slug } = ctx.params as { slug: string };

    // Load current recipe — need its categories and ingredients for scoring.
    const [current] = await strapi.documents('api::recipe.recipe').findMany({
      filters: { slug: { $eq: slug } } as any,
      fields: ['documentId', 'updatedAt'],
      populate: {
        categories: { fields: ['documentId'] },
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
    const currentIngredientNames = new Set<string>(
      (current as any).ingredients
        .map((i: any) => i.ingredientName?.toLowerCase().trim())
        .filter(Boolean)
    );

    // Load all other published recipes with categories and ingredients.
    const all = await strapi.documents('api::recipe.recipe').findMany({
      filters: { documentId: { $ne: (current as any).documentId } } as any,
      fields: ['documentId', 'title', 'slug', 'difficulty', 'prepTime', 'servings', 'updatedAt'],
      populate: {
        image: { fields: ['url', 'alternativeText', 'width', 'height'] },
        categories: { fields: ['documentId', 'name', 'slug'] },
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
    const scored = candidates.map((r) => {
      const sharedCategories = r.categories.filter((c: any) =>
        currentCategoryIds.has(c.documentId)
      ).length;

      const sharedIngredients = r.ingredients.filter((i: any) => {
        const name = i.ingredientName?.toLowerCase().trim();
        return name && currentIngredientNames.has(name);
      }).length;

      return {
        r,
        score: sharedCategories * 10 + sharedIngredients,
        sharedCategories,
        sharedIngredients,
      };
    });

    // Sort deterministically.
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.sharedCategories !== a.sharedCategories) return b.sharedCategories - a.sharedCategories;
      if (b.sharedIngredients !== a.sharedIngredients) return b.sharedIngredients - a.sharedIngredients;
      const da = new Date(a.r.updatedAt).getTime();
      const db = new Date(b.r.updatedAt).getTime();
      if (db !== da) return db - da;
      return a.r.documentId < b.r.documentId ? -1 : 1;
    });

    ctx.body = { data: scored.slice(0, 4).map(({ r }) => r) };
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
        AND similarity(title, ?) > 0.3

      UNION

      SELECT DISTINCT r.document_id FROM recipes r
      JOIN recipes_cmps rc
        ON rc.entity_id = r.id
        AND rc.field = 'ingredients'
      JOIN components_recipe_recipe_ingredients i
        ON i.id = rc.cmp_id
      WHERE r.published_at IS NOT NULL
        AND similarity(i.ingredient_name, ?) > 0.3
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
}));
