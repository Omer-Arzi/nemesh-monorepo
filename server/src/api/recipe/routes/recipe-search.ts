export default {
  routes: [
    {
      method: 'GET',
      path: '/recipes/search',
      handler: 'recipe.search',
      config: {
        auth: false,
      },
    },
  ],
};
