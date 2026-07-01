/**
 * Normalizes ingredient/query text for matching.
 *
 * Steps:
 *  1. Trim + lowercase + collapse whitespace
 *  2. Normalize Hebrew final letter forms to their regular equivalents
 *     (ך→כ  ם→מ  ן→נ  ף→פ  ץ→צ)
 *
 * Why final-letter normalization: users typing a partial word use regular
 * letter forms (e.g. "שומ" while meaning "שום") because the final form only
 * appears at word-end in stored text. Without normalization, trigram and ILIKE
 * matching both fail to connect the partial query to its stored counterpart.
 *
 * Intentionally minimal: no stemming, no nikud stripping, no fuzzy logic.
 */
export function normalizeText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/ך/g, 'כ')
    .replace(/ם/g, 'מ')
    .replace(/ן/g, 'נ')
    .replace(/ף/g, 'פ')
    .replace(/ץ/g, 'צ');
}
