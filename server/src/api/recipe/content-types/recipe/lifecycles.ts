import type { Core } from '@strapi/strapi';
import { processRecipeIngredients } from '../../../ingredient-match-candidate/services/processor';

declare const strapi: Core.Strapi;

export default {
  async afterCreate(event: { result: any }) {
    const { result } = event;

    // result.ingredients is not populated when created via REST API — re-fetch with populate.
    const recipe = await strapi.documents('api::recipe.recipe').findOne({
      documentId: result.documentId,
      populate: { ingredients: { fields: ['ingredientName'] } },
    });

    const ingredientLines: string[] = ((recipe as any)?.ingredients ?? [])
      .map((ing: any) => ing.ingredientName as string | undefined)
      .filter((text: string | undefined): text is string => Boolean(text));

    if (ingredientLines.length === 0) return;

    await processRecipeIngredients(strapi, result.documentId, ingredientLines);
  },
};
