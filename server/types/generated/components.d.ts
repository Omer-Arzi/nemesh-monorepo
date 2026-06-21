import type { Schema, Struct } from '@strapi/strapi';

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
      'recipe.preparation-step': RecipePreparationStep;
      'recipe.recipe-ingredient': RecipeRecipeIngredient;
      'recipe.recipe-tip': RecipeRecipeTip;
    }
  }
}
