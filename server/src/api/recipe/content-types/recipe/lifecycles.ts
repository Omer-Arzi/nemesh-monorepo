import type { Core } from '@strapi/strapi';
import { processRecipeIngredientsByDocumentId } from '../../../ingredient-match-candidate/services/processor';

declare const strapi: Core.Strapi;

export default {
  async afterCreate(event: { result: any }) {
    await processRecipeIngredientsByDocumentId(strapi, event.result.documentId);
  },
};
