import type { Core } from '@strapi/strapi';

const CATALOG_UID = 'api::ingredient-catalog-item.ingredient-catalog-item' as const;

type ApprovalInput = {
  normalizedText: string;
  selectedIngredient: { documentId: string };
};

/**
 * Called when a candidate is approved with a selectedIngredient.
 * Adds the normalizedText to the ingredient's variants array if not already present.
 *
 * Rules:
 *   - No duplicates
 *   - Existing variants are never removed
 *   - Only runs on explicit admin approval
 */
export async function handleCandidateApproval(
  strapi: Core.Strapi,
  { normalizedText, selectedIngredient }: ApprovalInput
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
