"use client";

import { useSyncExternalStore } from "react";

/**
 * True when the browser exposes the Web Share API (`navigator.share`) — iOS
 * Safari, Chrome / Firefox on Android, and some desktop browsers. Needs a
 * secure context, which production and `localhost` both are.
 *
 * `useSyncExternalStore` with a server snapshot of `false` keeps SSR and the
 * first client render in agreement; the real value lands right after.
 */
function detectNativeShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

const subscribe = () => () => {};

export function useCanNativeShare(): boolean {
  return useSyncExternalStore(subscribe, detectNativeShare, () => false);
}
