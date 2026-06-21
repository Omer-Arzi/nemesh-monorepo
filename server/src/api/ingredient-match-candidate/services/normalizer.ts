/**
 * Normalizes an ingredient text for matching.
 * Intentionally minimal: trim, lowercase, collapse whitespace.
 * No stemming, no language inference, no fuzzy logic.
 */
export function normalizeText(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}
