import type { Schema, Struct } from '@strapi/strapi';

export interface HomeAboutSection extends Struct.ComponentSchema {
  collectionName: 'components_home_about_sections';
  info: {
    description: 'Expandable about section shown on the homepage between the hero and latest recipes';
    displayName: 'About Section';
  };
  attributes: {
    body: Schema.Attribute.Blocks & Schema.Attribute.Required;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
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

export interface SharedFooterLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_footer_links';
  info: {
    description: 'Exactly one of page or externalUrl must be set. customLabel overrides page.title when present.';
    displayName: 'FooterLink';
  };
  attributes: {
    customLabel: Schema.Attribute.String;
    externalUrl: Schema.Attribute.String;
    openInNewTab: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    page: Schema.Attribute.Relation<
      'manyToOne',
      'api::content-page.content-page'
    >;
  };
}

export interface SharedFooterSection extends Struct.ComponentSchema {
  collectionName: 'components_shared_footer_sections';
  info: {
    description: 'A titled group of footer links';
    displayName: 'FooterSection';
  };
  attributes: {
    links: Schema.Attribute.Component<'shared.footer-link', true>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'home.about-section': HomeAboutSection;
      'recipe.ingredient-section': RecipeIngredientSection;
      'recipe.preparation-section': RecipePreparationSection;
      'recipe.preparation-step': RecipePreparationStep;
      'recipe.recipe-ingredient': RecipeRecipeIngredient;
      'recipe.recipe-tip': RecipeRecipeTip;
      'shared.footer-link': SharedFooterLink;
      'shared.footer-section': SharedFooterSection;
    }
  }
}
