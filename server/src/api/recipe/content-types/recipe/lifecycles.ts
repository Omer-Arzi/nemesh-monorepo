import type { Core } from '@strapi/strapi';
import { processRecipeIngredients } from '../../../ingredient-match-candidate/services/processor';

declare const strapi: Core.Strapi;

export default {
  async afterCreate(event: { result: any }) {
    const { result } = event;

    const ingredientLines: string[] = (result.ingredients ?? [])
      .map((ing: any) => ing.ingredientName as string | undefined)
      .filter((text: string | undefined): text is string => Boolean(text));

    if (ingredientLines.length === 0) return;

    await processRecipeIngredients(strapi, result.documentId, ingredientLines);
  },
};
