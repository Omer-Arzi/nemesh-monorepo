export default {
  routes: [
    {
      method: 'GET',
      path: '/recipes/:slug/related',
      handler: 'recipe.related',
      config: {
        auth: false,
      },
    },
  ],
};
