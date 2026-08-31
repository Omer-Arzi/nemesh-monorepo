import type { Core } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import { processRecipeIngredientsByDocumentId } from '../../../ingredient-match-candidate/services/processor';

declare const strapi: Core.Strapi;

/**
 * Best-effort extraction of the target documentId from a relation value as
 * submitted to the Document Service. A to-one relation nested inside a
 * component can arrive as a bare documentId string, a `{ documentId }`
 * object, or a `{ set: [...] }` / `{ connect: [...] }` operator wrapper
 * (Strapi normalizes relation input into these forms depending on caller).
 *
 * Returns null when the shape isn't recognized rather than guessing — a
 * missed self-reference here is still caught defensively by the client,
 * which never renders a preparationRecipe link back to the current recipe
 * regardless of what passed validation server-side.
 */
function extractRelationDocumentId(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const v = value as Record<string, unknown>;
    if (typeof v.documentId === 'string') return v.documentId;
    if (Array.isArray(v.set) && v.set.length > 0) return extractRelationDocumentId(v.set[0]);
    if (Array.isArray(v.connect) && v.connect.length > 0) return extractRelationDocumentId(v.connect[0]);
  }
  return null;
}

/** True if any ingredient's preparationRecipe in the submitted data points back at `documentId`. */
function hasSelfReferencingIngredient(data: any, documentId: string): boolean {
  const sections = Array.isArray(data?.ingredientSections) ? data.ingredientSections : [];
  for (const section of sections) {
    for (const ingredient of section?.ingredients ?? []) {
      const targetId = extractRelationDocumentId(ingredient?.preparationRecipe);
      if (targetId && targetId === documentId) return true;
    }
  }
  return false;
}

export default {
  async beforeUpdate(event: { params: any }) {
    const documentId = event.params?.documentId;
    if (!documentId) return;

    if (hasSelfReferencingIngredient(event.params?.data, documentId)) {
      throw new errors.ValidationError(
        'מרכיב במתכון לא יכול להפנות למתכון עצמו כמתכון הכנה.'
      );
    }
  },

  async afterCreate(event: { result: any }) {
    const documentId = event.result?.documentId;
    if (!documentId) return;
    try {
      await processRecipeIngredientsByDocumentId(strapi, documentId);
    } catch (err) {
      strapi.log.error('[recipe lifecycle] afterCreate ingredient processing failed:', err);
    }
  },

  async afterUpdate(event: { result: any }) {
    const documentId = event.result?.documentId;
    if (!documentId) return;
    try {
      await processRecipeIngredientsByDocumentId(strapi, documentId);
    } catch (err) {
      strapi.log.error('[recipe lifecycle] afterUpdate ingredient processing failed:', err);
    }
  },
};
