export default {
  routes: [
    {
      method: 'GET',
      path: '/recipes/suggestions',
      handler: 'recipe.suggestions',
      config: { auth: false },
    },
  ],
};
