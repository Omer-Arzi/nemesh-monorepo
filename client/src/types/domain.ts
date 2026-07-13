/**
 * Domain model types — the canonical shapes used throughout the application.
 *
 * Import these in components, hooks, features, and stores.
 * Do NOT import from src/types/api.ts outside of src/lib/api/.
 *
 * Derived from the Strapi content model in /server/src/api/.
 * `id` maps to Strapi's `documentId` (the stable string identifier).
 */

/** Every persisted entity has a stable string identifier. */
export type BaseEntity = {
  id: string; // maps to Strapi's documentId
};

/** Resolved image with display metadata. */
export type Image = {
  url: string;
  alt: string;
  width: number;
  height: number;
};

/** Recipe difficulty levels — mirrors the server enum. */
export type Difficulty = "easy" | "medium" | "hard";

// ─── Component types (not standalone entities) ────────────────────────────

/** A single ingredient line within a recipe. */
export type RecipeIngredient = {
  ingredientName: string | null;
  amount: number | null;
  unit: string | null;
  note: string | null;
};

/** A single preparation step within a recipe. */
export type PreparationStep = {
  description: string;
  image: Image | null;
};

/** A single tip attached to a recipe. */
export type RecipeTip = {
  text: string;
};

/**
 * A named preparation section containing its own ordered steps.
 * Used when a recipe has multiple distinct preparation phases
 * (e.g. "לקציפה", "לאספרגוס", "לרוטב").
 */
export type PreparationSection = {
  title: string | null;
  steps: PreparationStep[];
};

/**
 * A named ingredient section containing its own ingredient list.
 * Used when a recipe groups ingredients by component
 * (e.g. "לבצק", "למלית", "לציפוי").
 */
export type IngredientSection = {
  title: string | null;
  ingredients: RecipeIngredient[];
};

// ─── Collection types ─────────────────────────────────────────────────────

/** Content category for primary recipe navigation. */
export type Category = BaseEntity & {
  name: string;
  menuName: string | null;
  slug: string;
  description: string | null;
  image: Image | null;
};

/** Secondary descriptor tag — context, collection, or dietary attribute. */
export type Tag = BaseEntity & {
  name: string;
  slug: string;
  description: string | null;
  image: Image | null;
};

/**
 * Full recipe entity — all fields populated.
 * Used on recipe detail pages.
 */
export type Recipe = BaseEntity & {
  title: string;
  slug: string;
  image: Image | null;
  categories: Category[];
  tags: Tag[];
  servings: number | null;
  prepTime: number | null;
  difficulty: Difficulty | null;
  description: string | null;
  ingredientSections: IngredientSection[];
  preparationSections: PreparationSection[];
  tips: RecipeTip[];
  createdAt: string; // ISO 8601
  updatedAt: string;
};

/**
 * Partial recipe returned by the search endpoint.
 * Only listing-relevant fields are populated.
 */
export type RecipeSummary = Pick<
  Recipe,
  "id" | "title" | "slug" | "image" | "categories" | "tags" | "difficulty" | "prepTime" | "servings"
>;

/**
 * Canonical ingredient entry in the shared ingredient vocabulary.
 * Source of truth for normalised ingredient names.
 */
export type IngredientCatalogItem = BaseEntity & {
  canonicalName: string;
  slug: string;
  variants: string[] | null;
  approvalStatus: "approved" | "pending";
  notes: string | null;
};

// ─── Site branding ────────────────────────────────────────────────────────────

/**
 * Admin-managed logo assets from the site-setting single type.
 * Both fields are optional — components fall back to the local bundled logos.
 */
export type SiteBranding = {
  /** Desktop / default / full logo. Fallback: /images/branding/logo.svg */
  logo: Image | null;
  /** Mobile-specific logo. Fallback: /images/branding/logo-mobile.svg */
  mobileLogo: Image | null;
};

// ─── Homepage ─────────────────────────────────────────────────────────────────

/**
 * Content for the expandable About section on the homepage.
 * body and image are required — the section is suppressed if either is absent.
 * title is optional; the section renders without a heading when it is absent.
 */
export type HomepageAbout = {
  title: string | null;
  body: BlockNode[];
  image: Image;
};

/**
 * Editable homepage content from the homepage single type.
 * All fields are optional — components fall back to their built-in defaults
 * when a field is null (not yet filled in Strapi).
 */
export type HomePage = {
  heroTitle: string | null;
  heroSubtitle: string | null;
  heroBackgroundImage: Image | null;
  latestRecipesTitle: string | null;
  featuredCategoriesTitle: string | null;
  about: HomepageAbout | null;
};

// ─── Shir Challenge ───────────────────────────────────────────────────────────

export type MyProgressStatus = "idea" | "writing" | "cooked" | "published";

/** pending = announced but ingredient not yet revealed. */
export type MonthlyChallengeStatus = "pending" | "active" | "skipped";

/**
 * Static page-level content (single type).
 * Monthly challenge data lives in ShirChallengeMonth.
 */
export type ShirChallengePage = {
  title: string | null;
  badgeText: string | null;
  subtitle: string | null;
  heroImage: Image | null;
};

/** One record per calendar month in the shir-challenge-month collection. */
export type ShirChallengeMonth = BaseEntity & {
  monthKey: string;                          // "YYYY-MM"
  monthStart: string;                        // "YYYY-MM-DD"
  monthlyIngredientName: string | null;
  monthlyChallengeStatus: MonthlyChallengeStatus;
  monthlyChallengeNote: string | null;
  myProgressStatus: MyProgressStatus | null;
};

// ─── Strapi Blocks (rich text editor) ────────────────────────────────────────

export type BlockTextNode = {
  type: "text";
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
};

export type BlockLinkNode = {
  type: "link";
  url: string;
  children: BlockTextNode[];
};

export type BlockInlineNode = BlockTextNode | BlockLinkNode;

export type BlockListItemNode = {
  type: "list-item";
  children: BlockInlineNode[];
};

export type BlockParagraphNode = {
  type: "paragraph";
  children: BlockInlineNode[];
};

export type BlockHeadingNode = {
  type: "heading";
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: BlockInlineNode[];
};

export type BlockListNode = {
  type: "list";
  format: "ordered" | "unordered";
  children: BlockListItemNode[];
};

export type BlockQuoteNode = {
  type: "quote";
  children: BlockInlineNode[];
};

export type BlockCodeNode = {
  type: "code";
  children: BlockTextNode[];
};

export type BlockImageNode = {
  type: "image";
  image: {
    url: string;
    alternativeText: string | null;
    width: number;
    height: number;
  };
  children: BlockTextNode[];
};

export type BlockNode =
  | BlockParagraphNode
  | BlockHeadingNode
  | BlockListNode
  | BlockQuoteNode
  | BlockCodeNode
  | BlockImageNode;

// ─── Static pages ─────────────────────────────────────────────────────────────

export type Page = BaseEntity & {
  title: string;
  slug: string;
  summary: string | null;
  content: BlockNode[];
  showInFooter: boolean;
  footerSection: string | null;
  footerOrder: number | null;
};

// ─── Footer ───────────────────────────────────────────────────────────────────

export type FooterLink = {
  /** Overrides page.title when present. Required when externalUrl is set. */
  customLabel: string | null;
  page: { slug: string; title: string } | null;
  externalUrl: string | null;
  openInNewTab: boolean;
};

export type FooterSection = {
  title: string;
  links: FooterLink[];
};

export type FooterData = {
  sections: FooterSection[];
  copyrightText: string | null;
};
