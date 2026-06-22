/**
 * Recipe import CLI for Nemesh / Strapi v5.
 *
 * Modes:
 *   --extract   Parse a DOCX and write raw text + a normalization prompt for Claude Code.
 *   --preview   Validate a normalized JSON file, fix slugs, print summary.
 *   --commit    Import a normalized JSON file into Strapi via REST API.
 *
 * Usage:
 *   npm run import:recipes -- ./recipes.docx            --extract
 *   npm run import:recipes -- ./output/…/recipes.normalized.json --preview
 *   npm run import:recipes -- ./output/…/recipes.normalized.json --commit
 *
 * Required env vars:
 *   ENABLE_RECIPE_IMPORT=true        (all modes)
 *   STRAPI_URL=http://localhost:1337  (--commit only)
 *   STRAPI_IMPORT_TOKEN=<token>       (--commit only)
 */

import path from "path";
import fs from "fs";
import { mkdir, writeFile, readFile } from "fs/promises";

// Load .env from the server root if present.
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
} catch {
  // dotenv is optional — env vars may be set externally.
}

import { parseDocx } from "./parseDocx";
import { createRecipesInStrapi } from "./createRecipesInStrapi";
import { slugifyHebrew, ensureUniqueSlug } from "./slugifyHebrew";
import type { LLMRecipeOutput, NormalizedRecipe, NormalizedPreparationSection } from "./types";

// ── Safety gate ───────────────────────────────────────────────────────────────

if (process.env.ENABLE_RECIPE_IMPORT !== "true") {
  console.error(
    '\n[import-recipes] ERROR: ENABLE_RECIPE_IMPORT is not set to "true".\n' +
      "This script must be explicitly enabled to prevent accidental runs in production.\n" +
      "Set ENABLE_RECIPE_IMPORT=true in your environment or .env file before running.\n"
  );
  process.exit(1);
}

// ── Argument parsing ──────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const filePath = args.find((a) => !a.startsWith("--"));
const isExtract = args.includes("--extract");
const isPreview = args.includes("--preview");
const isCommit = args.includes("--commit");

const modeCount = [isExtract, isPreview, isCommit].filter(Boolean).length;

function printUsage() {
  console.error(
    "\nUsage:\n" +
      "  npm run import:recipes -- ./recipes.docx --extract\n" +
      "  npm run import:recipes -- ./output/…/recipes.normalized.json --preview\n" +
      "  npm run import:recipes -- ./output/…/recipes.normalized.json --commit\n"
  );
}

if (!filePath) {
  console.error("[import-recipes] ERROR: No file path provided.");
  printUsage();
  process.exit(1);
}

if (modeCount === 0) {
  console.error("[import-recipes] ERROR: Specify one of --extract, --preview, or --commit.");
  printUsage();
  process.exit(1);
}

if (modeCount > 1) {
  console.error("[import-recipes] ERROR: Only one mode flag may be used at a time.");
  printUsage();
  process.exit(1);
}

if (isCommit) {
  const missing: string[] = [];
  if (!process.env.STRAPI_URL) missing.push("STRAPI_URL");
  if (!process.env.STRAPI_IMPORT_TOKEN) missing.push("STRAPI_IMPORT_TOKEN");
  if (missing.length > 0) {
    console.error(
      `[import-recipes] ERROR: Missing env vars for --commit: ${missing.join(", ")}`
    );
    process.exit(1);
  }
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function timestamp(): string {
  const now = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}-${p(now.getHours())}-${p(now.getMinutes())}`;
}

function validate(raw: unknown): { recipes: LLMRecipeOutput[]; errors: string[] } {
  const errors: string[] = [];

  if (!Array.isArray(raw)) {
    errors.push("Top-level value is not a JSON array.");
    return { recipes: [], errors };
  }

  const recipes: LLMRecipeOutput[] = [];

  for (let i = 0; i < raw.length; i++) {
    const item = raw[i] as Record<string, unknown>;
    const label = `Recipe[${i}]`;

    if (typeof item !== "object" || item === null) {
      errors.push(`${label}: not an object.`);
      continue;
    }

    if (!item.title || typeof item.title !== "string" || item.title.trim() === "") {
      errors.push(`${label}: missing or empty "title".`);
      continue;
    }

    if (
      item.difficulty != null &&
      !["easy", "medium", "hard"].includes(item.difficulty as string)
    ) {
      errors.push(
        `${label} "${item.title}": invalid difficulty "${item.difficulty}" — must be easy | medium | hard | null.`
      );
    }

    if (!Array.isArray(item.ingredients)) {
      errors.push(`${label} "${item.title}": "ingredients" must be an array.`);
    }

    const hasSections =
      Array.isArray(item.preparationSections) &&
      (item.preparationSections as unknown[]).length > 0;
    const hasLegacySteps =
      Array.isArray(item.steps) && (item.steps as unknown[]).length > 0;

    if (!hasSections && !hasLegacySteps) {
      errors.push(`${label} "${item.title}": no steps or preparationSections found.`);
    }

    recipes.push(item as unknown as LLMRecipeOutput);
  }

  return { recipes, errors };
}

/**
 * Resolve preparationSections for each recipe:
 * - If preparationSections is present and non-empty, use it as-is.
 * - If only legacy steps is present, wrap them in a single unnamed section.
 * Also assigns slugs.
 */
function applySlugAndNormalize(recipes: LLMRecipeOutput[]): NormalizedRecipe[] {
  const usedSlugs = new Set<string>();

  return recipes.map((recipe) => {
    const existing = (recipe as NormalizedRecipe).slug;
    const baseSlug =
      existing && typeof existing === "string" && existing.trim()
        ? existing.trim()
        : slugifyHebrew(recipe.title);
    const slug = ensureUniqueSlug(baseSlug, usedSlugs);
    usedSlugs.add(slug);

    let preparationSections: NormalizedPreparationSection[];
    if (recipe.preparationSections && recipe.preparationSections.length > 0) {
      preparationSections = recipe.preparationSections;
    } else {
      preparationSections = [{ title: null, steps: recipe.steps ?? [] }];
    }

    const { steps: _steps, preparationSections: _sections, ...rest } = recipe;
    return { ...rest, slug, preparationSections };
  });
}

function printSummary(recipes: NormalizedRecipe[]) {
  console.log("── Recipes ───────────────────────────────────────────────────");
  for (const r of recipes) {
    const totalSteps = r.preparationSections.reduce((n, s) => n + s.steps.length, 0);
    const warnings: string[] = [];
    if (!r.ingredients.length) warnings.push("no ingredients");
    if (totalSteps === 0) warnings.push("no steps");
    const warn = warnings.length ? `  ⚠  ${warnings.join(", ")}` : "";
    console.log(`  ${r.title}`);
    console.log(`    slug:        ${r.slug}`);
    console.log(`    servings:    ${r.servings ?? "—"}`);
    console.log(`    prepTime:    ${r.prepTime != null ? `${r.prepTime} min` : "—"}`);
    console.log(`    difficulty:  ${r.difficulty ?? "—"}`);
    console.log(`    ingredients: ${r.ingredients.length}`);
    console.log(`    sections:    ${r.preparationSections.length}  (${totalSteps} steps total)${warn}`);
    for (const sec of r.preparationSections) {
      const label = sec.title ?? "(ללא כותרת)";
      console.log(`      • ${label}: ${sec.steps.length} steps`);
    }
  }
  console.log("─────────────────────────────────────────────────────────────\n");
}

// ── Modes ─────────────────────────────────────────────────────────────────────

async function runExtract(docxFile: string) {
  console.log(`\n[extract] Source: ${docxFile}\n`);

  console.log("[1/2] Extracting text from DOCX...");
  const rawText = await parseDocx(docxFile);
  console.log(`      ${rawText.split("\n").length} lines extracted.\n`);

  const ts = timestamp();
  const outputDir = path.join(__dirname, "output", ts);
  await mkdir(outputDir, { recursive: true });

  // raw.txt
  const rawFile = path.join(outputDir, "raw.txt");
  await writeFile(rawFile, rawText, "utf-8");

  // recipes.normalized.json — empty array, to be filled by Claude Code
  const normalizedFile = path.join(outputDir, "recipes.normalized.json");
  await writeFile(normalizedFile, "[]", "utf-8");

  // normalize-prompt.md — instructions for Claude Code
  const promptFile = path.join(outputDir, "normalize-prompt.md");
  const promptContent = buildNormalizePrompt(rawFile, normalizedFile);
  await writeFile(promptFile, promptContent, "utf-8");

  console.log("[2/2] Output written:\n");
  console.log(`  Raw text:      ${rawFile}`);
  console.log(`  Template JSON: ${normalizedFile}`);
  console.log(`  Claude prompt: ${promptFile}`);
  console.log(
    "\nNext step:\n" +
      "  Open normalize-prompt.md in Claude Code and follow the instructions.\n" +
      "  Claude Code will fill recipes.normalized.json with the structured data.\n" +
      "  Then run:\n" +
      `  npm run import:recipes -- ${normalizedFile} --preview\n`
  );
}

async function runPreview(jsonFile: string) {
  console.log(`\n[preview] Source: ${jsonFile}\n`);

  const raw = JSON.parse(await readFile(jsonFile, "utf-8")) as unknown;
  const { recipes: rawRecipes, errors } = validate(raw);

  if (errors.length > 0) {
    console.error("[preview] Validation errors:");
    errors.forEach((e) => console.error(`  ✗ ${e}`));
    if (rawRecipes.length === 0) process.exit(1);
    console.warn("\n[preview] Continuing with valid recipes only.\n");
  }

  const recipes = applySlugAndNormalize(rawRecipes);

  console.log(`${recipes.length} recipe(s) found.\n`);
  printSummary(recipes);

  const ts = timestamp();
  const outputDir = path.join(__dirname, "output");
  await mkdir(outputDir, { recursive: true });
  const outFile = path.join(outputDir, `preview-${ts}.json`);
  await writeFile(outFile, JSON.stringify(recipes, null, 2), "utf-8");

  console.log(`[preview] Validated JSON written to:\n  ${outFile}\n`);
}

async function runCommit(jsonFile: string) {
  console.log(`\n[commit] Source: ${jsonFile}\n`);

  const raw = JSON.parse(await readFile(jsonFile, "utf-8")) as unknown;
  const { recipes: rawRecipes, errors } = validate(raw);

  if (errors.length > 0) {
    console.error("[commit] Validation errors:");
    errors.forEach((e) => console.error(`  ✗ ${e}`));
    if (rawRecipes.length === 0) {
      console.error("[commit] No valid recipes to import.");
      process.exit(1);
    }
    console.warn("\n[commit] Continuing with valid recipes only.\n");
  }

  const recipes = applySlugAndNormalize(rawRecipes);
  console.log(`${recipes.length} recipe(s) to import.\n`);

  const results = await createRecipesInStrapi(
    recipes,
    process.env.STRAPI_URL!,
    process.env.STRAPI_IMPORT_TOKEN!
  );

  const created = results.filter((r) => r.status === "created").length;
  const skipped = results.filter((r) => r.status === "skipped").length;
  const failed  = results.filter((r) => r.status === "failed").length;

  const candidatesCreated = results.reduce((sum, r) => sum + (r.candidatesCreated ?? 0), 0);
  const candidatesSkipped = results.reduce((sum, r) => sum + (r.candidatesSkipped ?? 0), 0);
  const candidateWarnings = results.filter((r) => r.candidateError).length;

  console.log(
    "\n── Import complete ───────────────────────────────────────────\n" +
      `  Recipes created:          ${created}\n` +
      `  Recipes skipped:          ${skipped}\n` +
      `  Recipes failed:           ${failed}\n` +
      `  Ingredient candidates created: ${candidatesCreated}\n` +
      `  Ingredient candidates skipped: ${candidatesSkipped}\n` +
      (candidateWarnings > 0 ? `  Candidate warnings:       ${candidateWarnings}\n` : "") +
      "─────────────────────────────────────────────────────────────\n"
  );

  if (failed > 0) {
    console.error("[commit] Some recipes failed to import. See errors above.");
    process.exit(1);
  }
}

// ── Prompt template ───────────────────────────────────────────────────────────

function buildNormalizePrompt(rawFile: string, normalizedFile: string): string {
  return `# Normalize Recipes — Instructions for Claude Code

## Your task

1. Read the raw extracted text from:
   \`${rawFile}\`

2. Identify all recipes in the text. There may be one recipe or many.

3. Parse each recipe into the JSON structure described below.

4. Write the result as a JSON array to:
   \`${normalizedFile}\`
   (Overwrite the current empty \`[]\` with your output.)

---

## Required JSON structure

Write a **JSON array** where each element matches this shape:

\`\`\`json
[
  {
    "title": "שם המתכון בעברית",
    "description": "תיאור קצר (עד 300 תווים) או null",
    "servings": 4,
    "prepTime": 30,
    "difficulty": "easy",
    "ingredients": [
      { "ingredientName": "<שם מרכיב>", "amount": 200, "unit": "<יחידה>", "note": null },
      { "ingredientName": "<שם מרכיב>", "amount": null, "unit": null, "note": "<הערה אם יש>" }
    ],
    "preparationSections": [
      {
        "title": "<כותרת סעיף — למשל: לרוטב, לבצק, להרכבה — או null אם אין>",
        "steps": [
          { "description": "<שלב הכנה ראשון>" },
          { "description": "<שלב הכנה שני>" }
        ]
      }
    ],
    "tips": [
      { "text": "<טיפ אם קיים בטקסט>" }
    ],
    "categories": [],
    "tags": []
  }
]
\`\`\`

If a recipe has **no preparation sections** (single undivided set of steps), use a single section with \`"title": null\`:

\`\`\`json
"preparationSections": [
  {
    "title": null,
    "steps": [
      { "description": "שלב ראשון." },
      { "description": "שלב שני." }
    ]
  }
]
\`\`\`

---

## How to identify preparation sections

Look for headings that introduce a distinct preparation phase. Common patterns:

- **"אופן הכנה - <שם>"** → section title is the part after the dash (e.g. "לרוטב", "לבצק")
- **"לרוטב:", "לבצק:", "למילוי:", "להרכבה:", "להגשה:"** → each is a separate section title
- Any other clearly labelled sub-section heading before a list of steps

When in doubt, use a single section with \`"title": null\` rather than inventing section names.

---

## Field rules

| Field | Type | Rule |
|---|---|---|
| \`title\` | string | Required. Keep in Hebrew. |
| \`description\` | string \\| null | Max 300 characters. null if not present. |
| \`servings\` | number \\| null | Integer. null if not mentioned. |
| \`prepTime\` | number \\| null | Total time in **minutes**. Convert hours. null if unknown. |
| \`difficulty\` | "easy" \\| "medium" \\| "hard" \\| null | Only set if clearly inferrable. Otherwise null. |
| \`ingredientName\` | string | Keep in Hebrew. |
| \`amount\` | number \\| null | Numeric value only, no units here. null if unknown. |
| \`unit\` | string \\| null | e.g. "גרם", "כפית", "כוס". null if not applicable. |
| \`note\` | string \\| null | Clarification about the ingredient. null if none. |
| \`preparationSections[].title\` | string \\| null | Section heading in Hebrew, or null for a single unnamed section. |
| \`preparationSections[].steps[].description\` | string | Full text of the step. Keep in Hebrew. |
| \`tips[].text\` | string | Only tips clearly separated from steps. |
| \`categories\` | [] | Always empty array. Do not add values. |
| \`tags\` | [] | Always empty array. Do not add values. |

---

## Important constraints

- Output **only** valid JSON. No markdown fences, no explanation, no extra text.
- Return an **array**, even if there is only one recipe.
- **Never invent** ingredients, amounts, steps, servings, prep time, section titles, or any other data.
- If a field is missing from the source text, use \`null\` (for scalars) or \`[]\` (for arrays).
- Do **not** add a \`slug\` field — slugs are generated automatically by the import script.
- Do **not** add \`steps\` at the top level — use \`preparationSections\` only.
- If the document contains multiple recipes, include all of them in the array.
- Keep all Hebrew text in Hebrew. Do not translate.
`;
}

// ── Entry point ───────────────────────────────────────────────────────────────

async function main() {
  const resolved = path.resolve(process.cwd(), filePath!);

  if (!fs.existsSync(resolved)) {
    console.error(`[import-recipes] ERROR: File not found: ${resolved}`);
    process.exit(1);
  }

  if (isExtract) {
    if (!resolved.endsWith(".docx") && !resolved.endsWith(".DOCX")) {
      console.error("[import-recipes] ERROR: --extract requires a .docx file.");
      process.exit(1);
    }
    await runExtract(resolved);
  }

  if (isPreview) {
    if (!resolved.endsWith(".json")) {
      console.error("[import-recipes] ERROR: --preview requires a .json file.");
      process.exit(1);
    }
    await runPreview(resolved);
  }

  if (isCommit) {
    if (!resolved.endsWith(".json")) {
      console.error("[import-recipes] ERROR: --commit requires a .json file.");
      process.exit(1);
    }
    await runCommit(resolved);
  }
}

main().catch((err: unknown) => {
  console.error(
    "\n[import-recipes] Fatal error:",
    err instanceof Error ? err.message : err
  );
  process.exit(1);
});
