/**
 * One-time migration: convert recipes that store ingredient section titles
 * inside ingredient.note into the new ingredientSections structure.
 *
 * Detection rule:
 *   A note value that appears on 2+ ingredients in the same recipe is treated
 *   as a section title, not a real ingredient note.
 *
 * Real notes (preserved as-is):
 *   Values like "לא חובה", "ניתן להחליף בשמנת", "לפי הטעם", "חתוך למקלות"
 *   that appear on only one ingredient are left untouched.
 *
 * Idempotency:
 *   Recipes that already have ingredientSections are skipped entirely.
 *   Recipes where no note value repeats 2+ times are skipped.
 *   Safe to run multiple times.
 *
 * Usage:
 *   ENABLE_RECIPE_IMPORT=true STRAPI_URL=http://localhost:1337 STRAPI_IMPORT_TOKEN=<token> \
 *     npm run migrate:ingredient-sections
 */

import path from "path";

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
} catch {
  // dotenv is optional
}

// ── Safety gate ───────────────────────────────────────────────────────────────

if (process.env.ENABLE_RECIPE_IMPORT !== "true") {
  console.error(
    '\n[migrate] ERROR: ENABLE_RECIPE_IMPORT is not set to "true".\n' +
      "Set ENABLE_RECIPE_IMPORT=true before running this migration.\n"
  );
  process.exit(1);
}

const STRAPI_URL = process.env.STRAPI_URL;
const TOKEN = process.env.STRAPI_IMPORT_TOKEN;

if (!STRAPI_URL || !TOKEN) {
  console.error(
    "[migrate] ERROR: STRAPI_URL and STRAPI_IMPORT_TOKEN are required."
  );
  process.exit(1);
}

// ── Types ─────────────────────────────────────────────────────────────────────

type RawIngredient = {
  id: number;
  ingredientName: string | null;
  amount: number | null;
  unit: string | null;
  note: string | null;
};

type RawIngredientSection = {
  id: number;
  title: string | null;
  ingredients: RawIngredient[];
};

type RawRecipe = {
  id: number;
  documentId: string;
  title: string;
  ingredients: RawIngredient[];
  ingredientSections: RawIngredientSection[];
};

type BuiltSection = {
  title: string | null;
  ingredients: Omit<RawIngredient, "id">[];
};

// ── API helpers ───────────────────────────────────────────────────────────────

async function getHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${TOKEN}`,
  };
}

async function fetchRecipePage(page: number): Promise<{ data: RawRecipe[]; pageCount: number }> {
  const qs =
    "populate[ingredients]=true" +
    "&populate[ingredientSections][populate][ingredients]=true" +
    "&status=published" +
    `&pagination[page]=${page}` +
    "&pagination[pageSize]=50";

  const res = await fetch(`${STRAPI_URL}/api/recipes?${qs}`, {
    headers: await getHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch recipes page ${page}: HTTP ${res.status}`);

  const body = (await res.json()) as {
    data: RawRecipe[];
    meta: { pagination: { pageCount: number } };
  };
  return { data: body.data, pageCount: body.meta.pagination.pageCount };
}

async function updateRecipe(documentId: string, ingredientSections: BuiltSection[]): Promise<void> {
  const res = await fetch(`${STRAPI_URL}/api/recipes/${documentId}`, {
    method: "PUT",
    headers: await getHeaders(),
    body: JSON.stringify({
      data: {
        ingredientSections: ingredientSections.map((sec) => ({
          title: sec.title ?? undefined,
          ingredients: sec.ingredients.map((ing) => ({
            ingredientName: ing.ingredientName ?? undefined,
            amount: ing.amount ?? undefined,
            unit: ing.unit ?? undefined,
            note: ing.note ?? undefined,
          })),
        })),
      },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to update recipe ${documentId}: HTTP ${res.status} — ${text}`);
  }
}

// ── Migration logic ───────────────────────────────────────────────────────────

/**
 * Build ingredientSections from a flat ingredient list.
 *
 * Note values that appear on 2+ ingredients become section titles.
 * Single-occurrence notes are preserved as ingredient.note.
 * Ingredients are grouped in the order they first appear in the source list.
 */
function buildSections(ingredients: RawIngredient[]): BuiltSection[] | null {
  // Count occurrences of each non-null note value.
  const noteCounts = new Map<string, number>();
  for (const ing of ingredients) {
    if (ing.note) {
      noteCounts.set(ing.note, (noteCounts.get(ing.note) ?? 0) + 1);
    }
  }

  const sectionTitles = new Set(
    [...noteCounts.entries()].filter(([, count]) => count >= 2).map(([note]) => note)
  );

  if (sectionTitles.size === 0) return null; // Nothing to migrate.

  const sections: BuiltSection[] = [];
  let currentSection: BuiltSection | null = null;

  for (const ing of ingredients) {
    const isSectionTitle = ing.note != null && sectionTitles.has(ing.note);

    if (isSectionTitle) {
      const title = ing.note!;
      // Start a new section when the title changes.
      if (!currentSection || currentSection.title !== title) {
        currentSection = { title, ingredients: [] };
        sections.push(currentSection);
      }
      currentSection.ingredients.push({
        ingredientName: ing.ingredientName,
        amount: ing.amount,
        unit: ing.unit,
        note: null, // section title consumed — clear the note
      });
    } else {
      // Real note or no note — belongs to whatever section is current.
      if (!currentSection) {
        currentSection = { title: null, ingredients: [] };
        sections.push(currentSection);
      }
      currentSection.ingredients.push({
        ingredientName: ing.ingredientName,
        amount: ing.amount,
        unit: ing.unit,
        note: ing.note,
      });
    }
  }

  return sections.length > 0 ? sections : null;
}

// ── Entry point ───────────────────────────────────────────────────────────────

async function main() {
  console.log("\n[migrate] Starting ingredient section migration...\n");

  let recipesScanned = 0;
  let recipesMigrated = 0;
  let sectionsCreated = 0;
  let ingredientsMoved = 0;
  let recipesSkipped = 0;
  const warnings: string[] = [];
  const errors: string[] = [];

  let page = 1;
  let pageCount = 1;

  while (page <= pageCount) {
    let recipes: RawRecipe[];

    try {
      const result = await fetchRecipePage(page);
      recipes = result.data;
      pageCount = result.pageCount;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Page ${page}: ${msg}`);
      page++;
      continue;
    }

    for (const recipe of recipes) {
      recipesScanned++;

      // Skip recipes that already have ingredientSections.
      if (recipe.ingredientSections && recipe.ingredientSections.length > 0) {
        recipesSkipped++;
        continue;
      }

      if (!recipe.ingredients || recipe.ingredients.length === 0) {
        warnings.push(`"${recipe.title}" (${recipe.documentId}): no ingredients — skipped`);
        continue;
      }

      const sections = buildSections(recipe.ingredients);

      if (!sections) {
        // No repeated note values — nothing to migrate.
        continue;
      }

      try {
        await updateRecipe(recipe.documentId, sections);
        recipesMigrated++;
        sectionsCreated += sections.length;
        ingredientsMoved += sections.reduce((n, s) => n + s.ingredients.length, 0);
        console.log(
          `[migrated] "${recipe.title}" → ${sections.length} section(s): ` +
            sections.map((s) => s.title ?? "(unnamed)").join(", ")
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`"${recipe.title}" (${recipe.documentId}): ${msg}`);
      }
    }

    page++;
  }

  console.log(
    "\n── Migration complete ────────────────────────────────────────\n" +
      `  Recipes scanned:    ${recipesScanned}\n` +
      `  Recipes migrated:   ${recipesMigrated}\n` +
      `  Recipes skipped:    ${recipesSkipped}  (already have ingredientSections)\n` +
      `  Sections created:   ${sectionsCreated}\n` +
      `  Ingredients moved:  ${ingredientsMoved}\n` +
      `  Warnings:           ${warnings.length}\n` +
      `  Errors:             ${errors.length}\n` +
      "─────────────────────────────────────────────────────────────\n"
  );

  if (warnings.length > 0) {
    console.warn("[migrate] Warnings:");
    warnings.forEach((w) => console.warn(`  ⚠  ${w}`));
    console.log();
  }

  if (errors.length > 0) {
    console.error("[migrate] Errors:");
    errors.forEach((e) => console.error(`  ✗  ${e}`));
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error("\n[migrate] Fatal error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
