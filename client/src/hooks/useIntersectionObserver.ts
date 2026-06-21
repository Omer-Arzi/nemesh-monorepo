import { useEffect, useRef, type RefObject } from "react";

/**
 * Calls `onIntersect` whenever the observed element enters the viewport.
 *
 * Uses a saved-callback ref so the IntersectionObserver is only registered
 * once per element (or when `enabled` changes) — not on every render.
 * This prevents the sentinel from being unobserved/re-observed mid-scroll.
 *
 * @param ref      - RefObject pointing at the sentinel element
 * @param onIntersect - Called each time the element becomes visible
 * @param enabled  - Pass false to skip registration (e.g. no more pages)
 */
export function useIntersectionObserver(
  ref: RefObject<Element | null>,
  onIntersect: () => void,
  enabled = true
): void {
  const savedCallback = useRef(onIntersect);

  // Keep the ref in sync with the latest callback without re-registering the
  // observer. The effect below deliberately omits onIntersect from its deps.
  useEffect(() => {
    savedCallback.current = onIntersect;
  });

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) savedCallback.current();
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, enabled]);
}
