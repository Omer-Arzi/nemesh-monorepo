/**
 * One-time data restore: repopulate ingredientSections and preparationSections
 * for recipes whose component links were lost during a schema migration.
 *
 * Background:
 *   When the schema was migrated from flat `ingredients`/`steps` fields to the
 *   new `ingredientSections`/`preparationSections` structure, Strapi's internal
 *   migration deleted the `recipes_cmps` link rows for the old fields. The
 *   component data survived as orphaned rows, but is no longer accessible via
 *   the API. The `componentsrecipe_ingredient_sections` table currently has 0 rows.
 *
 *   This script restores the missing data by PUT-ing each recipe with its
 *   correct `ingredientSections` and `preparationSections` from the original
 *   normalized import files.
 *
 * Safety:
 *   - Read-only first pass: matches each source recipe to a Strapi document by title.
 *   - Only updates `ingredientSections` and `preparationSections` — all other fields
 *     (title, description, image, categories, tags, etc.) are left untouched.
 *   - Skips recipes whose `ingredientSections` already have data (already restored).
 *   - Safe to run multiple times.
 *
 * Usage:
 *   ENABLE_RECIPE_IMPORT=true STRAPI_URL=http://localhost:1337 STRAPI_IMPORT_TOKEN=<token> \
 *     npx tsx scripts/restore-recipe-sections.ts
 */

import * as path from "path";
import * as fs from "fs";

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
} catch {
  // dotenv is optional
}

// ── Safety gate ───────────────────────────────────────────────────────────────

if (process.env.ENABLE_RECIPE_IMPORT !== "true") {
  console.error(
    '\n[restore] ERROR: ENABLE_RECIPE_IMPORT is not set to "true".\n' +
      "Set ENABLE_RECIPE_IMPORT=true before running this script.\n"
  );
  process.exit(1);
}

const STRAPI_URL = process.env.STRAPI_URL;
const TOKEN = process.env.STRAPI_IMPORT_TOKEN;

if (!STRAPI_URL || !TOKEN) {
  console.error("[restore] ERROR: STRAPI_URL and STRAPI_IMPORT_TOKEN are required.");
  process.exit(1);
}

// ── Types ─────────────────────────────────────────────────────────────────────

type NormalizedIngredient = {
  ingredientName: string | null;
  amount: number | null;
  unit: string | null;
  note: string | null;
};

type NormalizedIngredientSection = {
  title: string | null;
  ingredients: NormalizedIngredient[];
};

type NormalizedStep = {
  description: string;
};

type NormalizedPreparationSection = {
  title: string | null;
  steps: NormalizedStep[];
};

type NormalizedRecipe = {
  title: string;
  slug?: string | null;
  ingredientSections: NormalizedIngredientSection[];
  preparationSections: NormalizedPreparationSection[];
};

type StrapiRecipeSummary = {
  id: number;
  documentId: string;
  title: string;
  ingredientSections: unknown[];
};

// ── Load source data ──────────────────────────────────────────────────────────

function loadNormalizedRecipes(): NormalizedRecipe[] {
  const outputDir = path.resolve(__dirname, "import-recipes/output");
  const allRecipes: NormalizedRecipe[] = [];
  const seen = new Set<string>();

  // Walk all timestamped output directories and collect normalized recipe files.
  const dirs = fs.readdirSync(outputDir).filter((d) => {
    const full = path.join(outputDir, d);
    return fs.statSync(full).isDirectory();
  });

  for (const dir of dirs.sort()) {
    const file = path.join(outputDir, dir, "recipes.normalized.json");
    if (!fs.existsSync(file)) continue;

    const raw = fs.readFileSync(file, "utf8");
    const parsed = JSON.parse(raw) as NormalizedRecipe | NormalizedRecipe[];
    const recipes = Array.isArray(parsed) ? parsed : [parsed];

    for (const recipe of recipes) {
      if (!seen.has(recipe.title)) {
        seen.add(recipe.title);
        allRecipes.push(recipe);
      }
    }
  }

  return allRecipes;
}

// ── Strapi helpers ────────────────────────────────────────────────────────────

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${TOKEN}`,
  };
}

async function fetchPublishedRecipes(): Promise<StrapiRecipeSummary[]> {
  const qs =
    "status=published" +
    "&populate[ingredientSections][populate][ingredients]=true" +
    "&pagination[pageSize]=100";

  const res = await fetch(`${STRAPI_URL}/api/recipes?${qs}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch recipes: HTTP ${res.status}`);

  const body = (await res.json()) as { data: StrapiRecipeSummary[] };
  return body.data;
}

async function restoreRecipeSections(
  documentId: string,
  ingredientSections: NormalizedIngredientSection[],
  preparationSections: NormalizedPreparationSection[]
): Promise<void> {
  const res = await fetch(`${STRAPI_URL}/api/recipes/${documentId}`, {
    method: "PUT",
    headers: authHeaders(),
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
        preparationSections: preparationSections.map((sec) => ({
          title: sec.title ?? undefined,
          steps: sec.steps.map((s) => ({ description: s.description })),
        })),
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PUT failed for ${documentId}: HTTP ${res.status} — ${text}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n[restore] Loading source recipes from normalized JSON files...");
  const sourceRecipes = loadNormalizedRecipes();
  console.log(`[restore] Found ${sourceRecipes.length} source recipe(s).\n`);

  console.log("[restore] Fetching published recipes from Strapi...");
  const strapiRecipes = await fetchPublishedRecipes();
  console.log(`[restore] Found ${strapiRecipes.length} published recipe(s) in Strapi.\n`);

  let restored = 0;
  let skipped = 0;
  const errors: string[] = [];
  const unmatched: string[] = [];

  for (const source of sourceRecipes) {
    // Match by exact title.
    const match = strapiRecipes.find((r) => r.title === source.title);

    if (!match) {
      unmatched.push(source.title);
      console.warn(`[restore] ⚠  No Strapi recipe found for: "${source.title}"`);
      continue;
    }

    // Skip if already has data.
    if (match.ingredientSections && match.ingredientSections.length > 0) {
      skipped++;
      console.log(`[restore] ↷  Already has sections — skipping: "${source.title}"`);
      continue;
    }

    const totalIngredients = source.ingredientSections.reduce(
      (n, s) => n + s.ingredients.length,
      0
    );
    const totalSteps = source.preparationSections.reduce(
      (n, s) => n + s.steps.length,
      0
    );

    try {
      await restoreRecipeSections(
        match.documentId,
        source.ingredientSections,
        source.preparationSections
      );
      restored++;
      console.log(
        `[restore] ✓  "${source.title}" — ` +
          `${source.ingredientSections.length} section(s), ` +
          `${totalIngredients} ingredient(s), ` +
          `${totalSteps} step(s)`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`"${source.title}": ${msg}`);
      console.error(`[restore] ✗  "${source.title}": ${msg}`);
    }
  }

  console.log(
    "\n── Restore complete ──────────────────────────────────────────\n" +
      `  Restored:   ${restored}\n` +
      `  Skipped:    ${skipped}  (already had data)\n` +
      `  Unmatched:  ${unmatched.length}\n` +
      `  Errors:     ${errors.length}\n` +
      "─────────────────────────────────────────────────────────────\n"
  );

  if (unmatched.length > 0) {
    console.warn("[restore] Unmatched source recipes (not found in Strapi):");
    unmatched.forEach((t) => console.warn(`  ⚠  ${t}`));
    console.log();
  }

  if (errors.length > 0) {
    console.error("[restore] Errors:");
    errors.forEach((e) => console.error(`  ✗  ${e}`));
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error("\n[restore] Fatal error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
