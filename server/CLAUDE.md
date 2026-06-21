# Nemesh Backend Context

## Project

Nemesh is a recipe website.

## Current scope

We are currently working only on the backend inside the /server directory.
Ignore the /client directory for now.

## Backend stack

* Strapi
* PostgreSQL

## Goal

Use Strapi as the CMS/admin panel for managing recipe content.

Additionally, the system should include a global ingredient catalog to support normalization and future features.

---

## Content model

### Recipe (collection type)

* title
* image
* categories
* servings
* prepTime
* difficulty (easy / medium / hard)
* description
* ingredients (array of RecipeIngredient components)
* tips
* steps

---

### IngredientCatalogItem (collection type)

Represents a canonical ingredient in the system.

* canonicalName (string)
* slug (string, optional)
* variants (array of strings, optional)
* approvalStatus (enum: approved / pending)
* notes (optional)

Purpose:

* Maintain a normalized ingredient vocabulary
* Support future features like autocomplete, filtering, and admin approval

---

### RecipeIngredient (component)

Represents an ingredient inside a specific recipe.

* rawText? (string) — free text input, used for ingredient processing
* amount? (number)
* unit? (string)
* note? (string)

Notes:

* Step 1: free text only via rawText. No direct relation to IngredientCatalogItem yet.
* The ingredient relation will be added in a later step after the candidate review system is in place.

---

### PreparationStep (component)

* description
* image? (optional)

---

## Design principles

* Separate between canonical data and contextual data
* Do not duplicate ingredient logic across the system
* Keep RecipeIngredient as a component, not a collection type
* Avoid unnecessary relations unless they provide real value
* Prefer simple solutions that can evolve over time

---

## Working style

* Be practical and production-oriented
* Avoid overengineering
* Keep the setup clean and maintainable
* Explain major decisions briefly
* Do not invent extra entities unless clearly useful
* Ask before changing the core data model
