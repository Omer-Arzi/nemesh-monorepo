import type { Core } from '@strapi/strapi';
import { processRecipeIngredientsByDocumentId } from '../../../ingredient-match-candidate/services/processor';

declare const strapi: Core.Strapi;

export default {
  async afterCreate(event: { result: any }) {
    const documentId = event.result?.documentId;
    if (!documentId) return;
    try {
      await processRecipeIngredientsByDocumentId(strapi, documentId);
    } catch (err) {
      strapi.log.error('[recipe lifecycle] afterCreate ingredient processing failed:', err);
    }
  },
};
