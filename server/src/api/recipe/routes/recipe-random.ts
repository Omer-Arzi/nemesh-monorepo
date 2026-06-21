export default {
  routes: [
    {
      method: 'GET',
      path: '/recipes/random',
      handler: 'recipe.random',
      config: {
        auth: false,
      },
    },
  ],
};
