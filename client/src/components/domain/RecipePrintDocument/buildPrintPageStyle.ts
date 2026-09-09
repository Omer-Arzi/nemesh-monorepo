import { lightTheme } from "@/lib/theme";
import { SITE_NAME, SITE_ALTERNATE_NAME } from "@/lib/seo/seoConfig";
import { HEEBO_FONT_STACK } from "@/lib/fonts";

/** Escapes a string for use inside a CSS `content: "..."` value. */
function cssContentString(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

/**
 * Builds the `pageStyle` string passed to `useReactToPrint`.
 *
 * react-to-print injects this as a `<style>` in the print iframe `<head>`. It
 * carries only page-level concerns — page size/margins and the repeating
 * footer margin boxes. Component styling comes from the themed subtree
 * (Emotion rules are copied into the iframe by the library).
 *
 * Footer (Chromium 131+ / Safari 18.2+ only — Firefox has no `@page`
 * margin-box support, an approved deviation, D10):
 *   - bottom-right (RTL start): site name
 *   - bottom-center:            recipe URL
 *   - bottom-left  (RTL end):   "עמוד X מתוך Y"
 *
 * The page counter is always rendered, including on a single-page printout
 * ("עמוד 1 מתוך 1"). The design's optional single-page treatment (site name +
 * URL only) is the accepted fallback here — see the implementation handoff.
 */
export function buildRecipePrintPageStyle(recipeUrl: string): string {
  const footerColor = lightTheme.palette.text.secondary;
  const siteName = `${SITE_NAME}${" · "}${SITE_ALTERNATE_NAME}`;
  const boxBase = `font-family: ${HEEBO_FONT_STACK}; font-size: 8.5pt; color: ${footerColor};`;

  return `
    html, body { margin: 0; padding: 0; }

    @media print {
      body {
        color-adjust: exact;
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
    }

    @page {
      size: A4;
      margin: 15mm 16mm 18mm;

      @bottom-right { ${boxBase} content: ${cssContentString(siteName)}; }
      @bottom-center { ${boxBase} content: ${cssContentString(recipeUrl)}; }
      @bottom-left { ${boxBase} content: "עמוד " counter(page) " מתוך " counter(pages); }
    }
  `;
}
