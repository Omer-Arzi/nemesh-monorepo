export {
  getSiteUrl,
  SITE_NAME,
  SITE_ALTERNATE_NAME,
  SITE_LOCALE,
  DEFAULT_OG_IMAGE,
  META_DESCRIPTION_MAX_LENGTH,
} from "./seoConfig";
export { buildWebSiteSchema, buildRecipeSchema, buildBreadcrumbSchema } from "./structuredData";
export { stripMarkdownToPlainText, truncateAtWordBoundary } from "./textUtils";
