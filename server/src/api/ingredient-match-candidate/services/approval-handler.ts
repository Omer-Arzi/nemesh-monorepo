import type { Core } from '@strapi/strapi';

const CATALOG_UID = 'api::ingredient-catalog-item.ingredient-catalog-item' as const;

const HEBREW_TO_LATIN: Record<string, string> = {
  א: 'a',  ב: 'b',  ג: 'g',  ד: 'd',  ה: 'h',
  ו: 'v',  ז: 'z',  ח: 'ch', ט: 't',  י: 'y',
  כ: 'k',  ך: 'k',  ל: 'l',  מ: 'm',  ם: 'm',
  נ: 'n',  ן: 'n',  ס: 's',  ע: 'a',  פ: 'p',
  ף: 'f',  צ: 'ts', ץ: 'ts', ק: 'k',  ר: 'r',
  ש: 'sh', ת: 't',
};

function slugifyIngredient(name: string): string {
  let result = '';
  for (const char of name) {
    if (HEBREW_TO_LATIN[char]) {
      result += HEBREW_TO_LATIN[char];
    } else if (/[a-zA-Z0-9]/.test(char)) {
      result += char.toLowerCase();
    } else if (/[\s\-_]/.test(char)) {
      result += '-';
    }
  }
  return result.replace(/-+/g, '-').replace(/^-|-$/g, '') || 'ingredient';
}

/**
 * Called when a candidate is approved with matchType 'canonical'.
 * Creates a new IngredientCatalogItem using the raw ingredient name as canonicalName.
 * No-ops if a catalog item with the same canonicalName already exists.
 */
export async function handleCanonicalApproval(
  strapi: Core.Strapi,
  ingredientName: string
): Promise<void> {
  const existing = await strapi.documents(CATALOG_UID).findFirst({
    filters: { canonicalName: ingredientName },
  });

  if (existing) {
    strapi.log.info(
      `[approval-handler] Catalog item "${ingredientName}" already exists — skipping creation`
    );
    return;
  }

  const slug = slugifyIngredient(ingredientName);

  await strapi.documents(CATALOG_UID).create({
    data: {
      canonicalName: ingredientName,
      slug,
      approvalStatus: 'approved',
    } as any,
  });

  strapi.log.info(`[approval-handler] Created catalog item "${ingredientName}"`);
}

/**
 * Called when a candidate is approved with matchType 'variant' and a selectedIngredient.
 * Adds the normalizedText to the ingredient's variants array if not already present.
 *
 * Rules:
 *   - No duplicates
 *   - Existing variants are never removed
 *   - Only runs on explicit admin approval
 */
export async function handleVariantApproval(
  strapi: Core.Strapi,
  normalizedText: string,
  selectedIngredient: { documentId: string }
): Promise<void> {
  const ingredient = await strapi.documents(CATALOG_UID).findOne({
    documentId: selectedIngredient.documentId,
  });

  if (!ingredient) {
    strapi.log.warn(
      `[approval-handler] selectedIngredient ${selectedIngredient.documentId} not found — skipping variant update`
    );
    return;
  }

  const currentVariants = (Array.isArray(ingredient.variants)
    ? ingredient.variants
    : []) as string[];

  if (currentVariants.includes(normalizedText)) {
    strapi.log.info(
      `[approval-handler] "${normalizedText}" already in variants of ${ingredient.canonicalName} — skipping`
    );
    return;
  }

  await strapi.documents(CATALOG_UID).update({
    documentId: selectedIngredient.documentId,
    data: { variants: [...currentVariants, normalizedText] },
  });

  strapi.log.info(
    `[approval-handler] Added "${normalizedText}" to variants of "${ingredient.canonicalName}"`
  );
}
