"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Box from "@mui/material/Box";
import type { Recipe } from "@/types/domain";
import RecipePrintDocument from "./RecipePrintDocument";

const HOST_ATTR = "data-nemesh-recipe-print";

/**
 * Mobile-browser print path for the recipe document.
 *
 * `react-to-print` (the desktop path in RecipeContent) prints by cloning the
 * document into an off-screen `<iframe>` and calling
 * `iframe.contentWindow.print()`. Mobile browsers — iOS Safari especially,
 * and Chrome / Firefox on Android — ignore the sub-frame and print the
 * top-level page, so the reader gets the whole live site (header, hero, nav,
 * accordions…) across many pages instead of the print document.
 *
 * This path avoids the iframe: it portals a real `RecipePrintDocument` in as
 * the last child of `<body>`, injects a scoped stylesheet that (a) carries the
 * page-level `@page` rules and (b) hides every *other* top-level node while
 * printing, then calls the top-level `window.print()` — which mobile handles
 * correctly.
 *
 * Cleanup runs on `afterprint`, and — because iOS Safari never fires it — also
 * when the page regains focus / visibility, plus a safety timeout. Every path
 * is idempotent.
 *
 * The desktop path is untouched; RecipeContent only wires this up when a
 * mobile browser is detected (`useIsMobileBrowser`).
 */
export function useMobileRecipePrint(recipe: Recipe, pageStyle: string) {
  const [isPrinting, setIsPrinting] = useState(false);

  const startPrint = useCallback(() => setIsPrinting(true), []);

  useEffect(() => {
    if (!isPrinting) return;

    const style = document.createElement("style");
    style.setAttribute(HOST_ATTR, "style");
    style.textContent = `
      ${pageStyle}
      @media screen {
        body > [${HOST_ATTR}="host"] {
          position: absolute !important;
          left: -100vw !important;
          top: 0 !important;
          width: 210mm !important;
        }
      }
      @media print {
        body > *:not([${HOST_ATTR}="host"]) { display: none !important; }
      }
    `;
    document.head.appendChild(style);

    const prevTitle = document.title;
    if (recipe.title) document.title = recipe.title;

    let done = false;
    let focusTimer = 0;
    let safetyTimer = 0;
    let printTimer = 0;

    const cleanup = () => {
      if (done) return;
      done = true;
      window.clearTimeout(focusTimer);
      window.clearTimeout(safetyTimer);
      window.clearTimeout(printTimer);
      window.removeEventListener("afterprint", cleanup);
      window.removeEventListener("focus", cleanup);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      style.remove();
      document.title = prevTitle;
      setIsPrinting(false);
    };

    function onVisibilityChange() {
      if (document.visibilityState === "visible") cleanup();
    }

    window.addEventListener("afterprint", cleanup);
    // iOS Safari doesn't fire `afterprint`; it regains focus / visibility when
    // the native print sheet is dismissed. Registered on the next tick so the
    // focus the dialog itself takes doesn't trip it immediately.
    focusTimer = window.setTimeout(() => {
      window.addEventListener("focus", cleanup);
      document.addEventListener("visibilitychange", onVisibilityChange);
    }, 0);
    safetyTimer = window.setTimeout(cleanup, 60_000);

    // This effect runs after React has committed the portal, so the print
    // document is already in the DOM. Wait for its images (logo + header
    // photo — both already cached from the live page, but be safe on a slow
    // device) to decode, then open the dialog. A `setTimeout`, not
    // `requestAnimationFrame`: rAF is throttled to zero in a backgrounded tab,
    // which would strand the flow.
    printTimer = window.setTimeout(async () => {
      const host = document.querySelector(`[${HOST_ATTR}="host"]`);
      const imgs = host ? Array.from(host.querySelectorAll("img")) : [];
      await Promise.all(
        imgs.map((img) =>
          img.complete || typeof img.decode !== "function"
            ? undefined
            : img.decode().catch(() => {}),
        ),
      );
      if (!done) window.print();
    }, 60);

    return cleanup;
  }, [isPrinting, pageStyle, recipe.title]);

  const printPortal = isPrinting
    ? createPortal(
        <Box aria-hidden {...{ [HOST_ATTR]: "host" }}>
          <RecipePrintDocument recipe={recipe} />
        </Box>,
        document.body,
      )
    : null;

  return { startPrint, printPortal };
}
