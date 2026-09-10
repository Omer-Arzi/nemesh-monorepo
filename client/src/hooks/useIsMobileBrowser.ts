"use client";

import { useSyncExternalStore } from "react";

/**
 * True on mobile browsers whose print pipeline cannot target an `<iframe>` —
 * iOS Safari (every engine on iOS is WebKit) and Chrome / Firefox on Android.
 * On those, `iframe.contentWindow.print()` prints the *top-level* page, so any
 * iframe-based print helper (e.g. `react-to-print`) silently prints the whole
 * live site instead of the intended document.
 *
 * There is no feature test for this, so it is a user-agent check. A false
 * positive only swaps one correct print path for another; a false negative on
 * a real phone is the bug we are avoiding, so the matching is deliberately
 * broad.
 *
 * `useSyncExternalStore` with a server snapshot of `false` keeps SSR and the
 * first client render in agreement (no hydration mismatch); the real value
 * lands on the client immediately after.
 */

function detectMobileBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isIOS =
    /iPhone|iPad|iPod/.test(ua) ||
    // iPadOS 13+ sends a desktop-Safari UA but is still a touch device.
    (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/.test(ua);
  return isIOS || isAndroid;
}

const subscribe = () => () => {};

export function useIsMobileBrowser(): boolean {
  return useSyncExternalStore(
    subscribe,
    detectMobileBrowser,
    () => false,
  );
}
