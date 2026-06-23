import type { Core } from '@strapi/strapi';
import { slugifyHebrew } from '../../../utils/slugifyHebrew';

const CATALOG_UID = 'api::ingredient-catalog-item.ingredient-catalog-item' as const;

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

  const slug = slugifyHebrew(ingredientName, 'ingredient');

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
