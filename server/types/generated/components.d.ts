import type { Schema, Struct } from '@strapi/strapi';

export interface ChallengeIntroStep extends Struct.ComponentSchema {
  collectionName: 'components_challenge_intro_steps';
  info: {
    description: 'A step in the Shir Challenge introduction';
    displayName: 'IntroStep';
  };
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface RecipeIngredientSection extends Struct.ComponentSchema {
  collectionName: 'components_recipe_ingredient_sections';
  info: {
    description: '';
    displayName: 'IngredientSection';
  };
  attributes: {
    ingredients: Schema.Attribute.Component<'recipe.recipe-ingredient', true>;
    title: Schema.Attribute.String;
  };
}

export interface RecipePreparationSection extends Struct.ComponentSchema {
  collectionName: 'components_recipe_preparation_sections';
  info: {
    description: '';
    displayName: 'PreparationSection';
  };
  attributes: {
    steps: Schema.Attribute.Component<'recipe.preparation-step', true>;
    title: Schema.Attribute.String;
  };
}

export interface RecipePreparationStep extends Struct.ComponentSchema {
  collectionName: 'components_recipe_preparation_steps';
  info: {
    description: '';
    displayName: 'PreparationStep';
  };
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    image: Schema.Attribute.Media<'images'>;
  };
}

export interface RecipeRecipeIngredient extends Struct.ComponentSchema {
  collectionName: 'components_recipe_recipe_ingredients';
  info: {
    description: '';
    displayName: 'RecipeIngredient';
  };
  attributes: {
    amount: Schema.Attribute.Float;
    ingredientName: Schema.Attribute.String;
    note: Schema.Attribute.String;
    unit: Schema.Attribute.String;
  };
}

export interface RecipeRecipeTip extends Struct.ComponentSchema {
  collectionName: 'components_recipe_recipe_tips';
  info: {
    description: '';
    displayName: 'RecipeTip';
  };
  attributes: {
    text: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'challenge.intro-step': ChallengeIntroStep;
      'recipe.ingredient-section': RecipeIngredientSection;
      'recipe.preparation-section': RecipePreparationSection;
      'recipe.preparation-step': RecipePreparationStep;
      'recipe.recipe-ingredient': RecipeRecipeIngredient;
      'recipe.recipe-tip': RecipeRecipeTip;
    }
  }
}
