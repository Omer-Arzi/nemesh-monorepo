import { useEffect, useState } from "react";

/**
 * Returns true once the page has scrolled past `threshold` pixels.
 *
 * Uses a passive scroll listener so it never blocks scrolling.
 * Bails out of setState when the boolean value doesn't change, keeping
 * re-renders to exactly one per threshold crossing.
 */
export function useScrolled(threshold = 32): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const check = () => {
      const isScrolled = window.scrollY > threshold;
      setScrolled((prev) => (prev === isScrolled ? prev : isScrolled));
    };

    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, [threshold]);

  return scrolled;
}
