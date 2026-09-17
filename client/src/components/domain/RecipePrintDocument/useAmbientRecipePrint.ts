"use client";

import { useEffect } from "react";
import type { RefObject } from "react";

/**
 * Ambient print path — the reader's own Ctrl+P / File>Print / a mobile
 * browser's own Print menu item, none of which go through `useReactToPrint`
 * or `useMobileRecipePrint` at all (those only run when the on-screen
 * `PrintRecipeButton` is actually clicked).
 *
 * `beforeprint`/`afterprint` fire only on the window whose own `.print()`
 * was invoked (or Ctrl+P'd) — the desktop button's `react-to-print` calls
 * `.print()` on its own hidden iframe's `contentWindow`, which does NOT
 * dispatch a `beforeprint` event on this (parent) window. That makes this
 * hook a true no-op for the desktop button path by construction, with no
 * need to detect "was this the button" at all.
 *
 * On `beforeprint`, walks up from the print document's own root to `<body>`
 * and, at every level, hides (`display: none`) every OTHER sibling —
 * `display` (not `visibility`) so hidden elements stop contributing height
 * to the page's print pagination too. Without this, the rest of the live
 * page stays in normal flow (merely invisible), and the browser generates
 * extra printed pages to cover its full height — pages that carry the
 * repeating `@page` footer but no content. `afterprint` restores every
 * mutated element's original `style` attribute exactly.
 *
 * Safe to run redundantly during the mobile button's own internal
 * `window.print()` call (which DOES fire this window's `beforeprint`): that
 * path's own stylesheet (`useMobileRecipePrint`) already hides the entire
 * app root — including this print document's ancestor chain — via a
 * higher-priority, ancestor-level `!important` rule, so anything this hook
 * additionally (and redundantly) hides or leaves alone there has no visual
 * effect either way.
 */
export function useAmbientRecipePrint(printRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const restore: { el: HTMLElement; prevStyle: string | null }[] = [];

    const handleBeforePrint = () => {
      let el: HTMLElement | null = printRef.current;
      if (!el) return;

      while (el && el !== document.body) {
        const parent: HTMLElement | null = el.parentElement;
        if (!parent) break;
        for (const child of Array.from(parent.children)) {
          if (child === el) continue;
          const sibling = child as HTMLElement;
          restore.push({ el: sibling, prevStyle: sibling.getAttribute("style") });
          sibling.style.setProperty("display", "none", "important");
        }
        el = parent;
      }
    };

    const handleAfterPrint = () => {
      for (const { el, prevStyle } of restore) {
        if (prevStyle === null) el.removeAttribute("style");
        else el.setAttribute("style", prevStyle);
      }
      restore.length = 0;
    };

    window.addEventListener("beforeprint", handleBeforePrint);
    window.addEventListener("afterprint", handleAfterPrint);
    return () => {
      window.removeEventListener("beforeprint", handleBeforePrint);
      window.removeEventListener("afterprint", handleAfterPrint);
      // Safety net: restore anything left hidden if the component unmounts
      // mid-print (afterprint didn't fire yet).
      handleAfterPrint();
    };
  }, [printRef]);
}
