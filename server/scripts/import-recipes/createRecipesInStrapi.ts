import type { NormalizedRecipe, ImportResult } from "./types";

async function slugExists(slug: string, strapiUrl: string, token: string): Promise<boolean> {
  const url = `${strapiUrl}/api/recipes?filters[slug][$eq]=${encodeURIComponent(slug)}&status=published`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Strapi slug check failed (HTTP ${res.status}) for slug "${slug}"`);
  }

  const body = (await res.json()) as { data: unknown[] };
  return body.data.length > 0;
}

function buildRequestBody(recipe: NormalizedRecipe) {
  return {
    data: {
      title: recipe.title,
      slug: recipe.slug,
      description: recipe.description ?? undefined,
      servings: recipe.servings ?? undefined,
      prepTime: recipe.prepTime ?? undefined,
      difficulty: recipe.difficulty ?? undefined,
      ingredients: recipe.ingredients.map((ing) => ({
        ingredientName: ing.ingredientName,
        amount: ing.amount ?? undefined,
        unit: ing.unit ?? undefined,
        note: ing.note ?? undefined,
      })),
      preparationSections: recipe.preparationSections.map((section) => ({
        title: section.title ?? undefined,
        steps: section.steps.map((s) => ({ description: s.description })),
      })),
      tips: recipe.tips.map((t) => ({ text: t.text })),
    },
  };
}

async function processIngredientCandidates(
  documentId: string,
  title: string,
  strapiUrl: string,
  token: string
): Promise<{ created: number; skipped: number } | null> {
  try {
    const res = await fetch(
      `${strapiUrl}/api/recipes/${documentId}/process-ingredient-candidates`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.warn(
        `[candidates] WARNING: "${title}" — candidate creation failed (HTTP ${res.status}): ${errText}`
      );
      return null;
    }

    const body = (await res.json()) as { data: { created: number; skipped: number } };
    return body.data;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[candidates] WARNING: "${title}" — candidate creation error: ${message}`);
    return null;
  }
}

/**
 * POST each recipe to Strapi via REST API.
 * Skips recipes whose slug already exists. Continues on individual failures.
 * After each successful create, triggers ingredient candidate creation.
 * Returns a result record for every recipe.
 */
export async function createRecipesInStrapi(
  recipes: NormalizedRecipe[],
  strapiUrl: string,
  token: string
): Promise<ImportResult[]> {
  const results: ImportResult[] = [];

  for (const recipe of recipes) {
    try {
      const exists = await slugExists(recipe.slug, strapiUrl, token);

      if (exists) {
        console.warn(`[skip]    "${recipe.title}" — slug "${recipe.slug}" already exists.`);
        results.push({ recipe, status: "skipped" });
        continue;
      }

      const res = await fetch(`${strapiUrl}/api/recipes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(buildRequestBody(recipe)),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errText}`);
      }

      const body = (await res.json()) as { data: { documentId: string } };
      const documentId = body.data?.documentId;

      console.log(`[created] "${recipe.title}" (slug: ${recipe.slug})`);

      const result: ImportResult = { recipe, status: "created", documentId };

      if (documentId) {
        const candidates = await processIngredientCandidates(
          documentId,
          recipe.title,
          strapiUrl,
          token
        );
        if (candidates) {
          result.candidatesCreated = candidates.created;
          result.candidatesSkipped = candidates.skipped;
          console.log(
            `[candidates] "${recipe.title}" — ${candidates.created} created, ${candidates.skipped} skipped`
          );
        } else {
          result.candidateError = "candidate creation failed (see warnings above)";
        }
      } else {
        console.warn(`[candidates] WARNING: "${recipe.title}" — no documentId in create response, skipping candidate creation`);
        result.candidateError = "no documentId in create response";
      }

      results.push(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[failed]  "${recipe.title}": ${message}`);
      results.push({ recipe, status: "failed", error: message });
    }
  }

  return results;
}
