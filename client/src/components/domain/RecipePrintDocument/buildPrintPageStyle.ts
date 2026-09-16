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

/**
 * Ambient print rule for the "no explicit trigger" case: the reader's own
 * Ctrl+P / File>Print / mobile browser-menu Print, none of which go through
 * `useReactToPrint` or `useMobileRecipePrint` at all — those only run when
 * the on-screen `PrintRecipeButton` is actually clicked. Without this, any
 * other way of invoking print falls through to printing the live page
 * itself (header, hero, nav…), since a browser's native print pipeline only
 * ever prints the current top-level document unless CSS tells it otherwise.
 *
 * Always rendered (not conditional on any click) as a plain `<style>` tag on
 * the recipe page, right beside the always-present, offscreen
 * `RecipePrintDocument`. Pure CSS, so it applies no matter how printing is
 * invoked or on what device — this is what makes "choose Print from the
 * browser's own menu" show the same document as the button, on desktop and
 * mobile alike.
 *
 * `visibility` (not `display`) drives the hide/show split: a `visibility:
 * hidden` ancestor still occupies its normal layout space, so the print
 * document must be pulled out of flow (`position: absolute`, anchored to the
 * page's own top/inline edges) to appear at the top of the printed page
 * instead of wherever it happens to sit amid all that now-invisible-but-
 * still-occupying-space live content — the standard "print only this
 * element" CSS pattern.
 *
 * Scoped to the recipe page only (it's rendered inside `RecipeContent`, only
 * mounted on `/recipes/[slug]`) — this must never leak onto any other page,
 * or that page's own Ctrl+P would hide everything and reveal nothing.
 *
 * Coexists with the other two print paths without conflict:
 *  - Inside react-to-print's cloned iframe (desktop button), the print
 *    document IS the entire body, so "hide everything, then re-show the
 *    print root and its descendants" is a no-op — nothing else is there to
 *    stay hidden.
 *  - The mobile portal (`useMobileRecipePrint`) already `display: none`s
 *    every other top-level node, which removes them from rendering outright;
 *    this rule only ever touches `visibility`, so the two never fight over
 *    the same property on the same element.
 */
export const RECIPE_PRINT_AMBIENT_STYLE = `
  @media print {
    body * {
      visibility: hidden;
    }
    [data-nemesh-recipe-print="document"],
    [data-nemesh-recipe-print="document"] * {
      visibility: visible;
    }
    [data-nemesh-recipe-print="document"] {
      position: absolute;
      top: 0;
      inset-inline: 0;
    }
  }
`;
