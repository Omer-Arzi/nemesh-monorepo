/**
 * Plain-text helpers for the metadata / JSON-LD boundary ONLY.
 *
 * Neither function here should ever be applied to text rendered on the page
 * itself (RecipeHero, PreparationSteps, etc. keep rendering the raw
 * markdown-source string exactly as today) — these exist purely for
 * `generateMetadata()` (meta/OG/Twitter description) and `structuredData.ts`
 * (Recipe JSON-LD `description` and `HowToStep.text`).
 */

/**
 * Strips a narrow set of common inline Markdown constructs down to plain
 * text. NOT a full CommonMark parser — headers, lists, blockquotes, images,
 * etc. are intentionally out of scope. Handles only what an editor
 * realistically types into a short recipe description or step:
 *
 *   **bold**          → bold
 *   *italic* / _italic_ → italic
 *   `inline code`      → inline code
 *   [link text](url)   → link text   (the URL is dropped)
 *
 * Any resulting double-whitespace/newlines left behind by stripped syntax
 * are collapsed into single spaces, and the result is trimmed — metadata
 * and JSON-LD text fields are single-line.
 */
export function stripMarkdownToPlainText(source: string): string {
  if (!source) return "";

  let text = source;

  // [text](url) → text — must run before the italic/bold passes below, or
  // the brackets/parens would be left dangling once the link is gone.
  text = text.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");

  // **bold** → bold — must run before the single-asterisk italic pass,
  // otherwise `**bold**` would be read as nested `*​*bold*​*`.
  text = text.replace(/\*\*([^*]+)\*\*/g, "$1");

  // *italic* / _italic_ → italic
  text = text.replace(/\*([^*]+)\*/g, "$1");
  text = text.replace(/_([^_]+)_/g, "$1");

  // `inline code` → inline code
  text = text.replace(/`([^`]+)`/g, "$1");

  text = text.replace(/\s+/g, " ").trim();

  return text;
}

/**
 * Mechanically truncates `text` to at most `maxLength` characters, cutting
 * at the nearest preceding word boundary and appending a single trailing
 * ellipsis character when truncation actually occurs. Purely mechanical —
 * this is not editorial rewriting, just a safe cut point.
 */
export function truncateAtWordBoundary(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  const sliced = text.slice(0, maxLength);
  const lastSpace = sliced.lastIndexOf(" ");
  const safe = lastSpace > 0 ? sliced.slice(0, lastSpace) : sliced;

  return `${safe.trimEnd()}…`;
}
