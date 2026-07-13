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
 * Adds the approved variant text (sourced from the candidate's ingredientName at the
 * time of approval — not normalizedText, which is a lossy matching key) to the
 * ingredient's variants array if not already present.
 *
 * Rules:
 *   - No duplicates (exact string match)
 *   - Empty / whitespace-only text is rejected
 *   - Existing variants are never removed
 *   - Only runs on explicit admin approval
 */
export async function handleVariantApproval(
  strapi: Core.Strapi,
  variantText: string,
  selectedIngredient: { documentId: string }
): Promise<void> {
  const trimmedVariantText = variantText.trim();

  if (!trimmedVariantText) {
    strapi.log.warn(
      `[approval-handler] Empty ingredientName submitted for variant approval of ${selectedIngredient.documentId} — skipping variant update`
    );
    return;
  }

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

  if (currentVariants.includes(trimmedVariantText)) {
    strapi.log.info(
      `[approval-handler] "${trimmedVariantText}" already in variants of ${ingredient.canonicalName} — skipping`
    );
    return;
  }

  await strapi.documents(CATALOG_UID).update({
    documentId: selectedIngredient.documentId,
    data: { variants: [...currentVariants, trimmedVariantText] },
  });

  strapi.log.info(
    `[approval-handler] Added "${trimmedVariantText}" to variants of "${ingredient.canonicalName}"`
  );
}
