export default {
  routes: [
    {
      method: 'POST',
      path: '/recipes/:documentId/process-ingredient-candidates',
      handler: 'recipe.processIngredientCandidates',
    },
  ],
};
