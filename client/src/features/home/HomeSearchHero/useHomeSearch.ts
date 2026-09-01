"use client";

import { useState, useEffect, useId } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants";
import type { SearchSuggestion } from "@/lib/api/services/suggestionsService";
import { useSearchSuggestions } from "./useSearchSuggestions";

export type HomeSearch = ReturnType<typeof useHomeSearch>;

function normalizeForExactMatch(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Finds the suggestion Enter should select when nothing is highlighted:
 * an ingredient suggestion whose label exactly equals the full query text,
 * preferring an exact variant match over an exact canonical match (a query
 * can only exactly equal one or the other for a given catalog row, but
 * different rows could each contribute one — variant wins, matching the
 * required priority order).
 *
 * Requiring `label === query` (not just "some suggestion exists") is what
 * guards against a debounce race: if the user presses Enter before the
 * suggestions for the just-typed text have loaded, `suggestions` still
 * reflects an earlier, shorter query, so no label will equal the full
 * current query and this correctly returns undefined (free-text fallback)
 * rather than acting on stale data.
 *
 * Only "variant"/"canonical" matchTypes are ever exact-query matches — the
 * backend only assigns them when the normalized query equalled that exact
 * catalog text (see suggestion-ranking.ts). "canonical-parent"/"partial"
 * are deliberately excluded even if their label happened to equal the
 * query string by coincidence.
 */
export function resolveExactSuggestion(
  query: string,
  suggestions: SearchSuggestion[]
): SearchSuggestion | undefined {
  const nq = normalizeForExactMatch(query);
  if (!nq) return undefined;

  const isExact = (matchType: "variant" | "canonical") => (s: SearchSuggestion) =>
    s.type === "ingredient" && s.matchType === matchType && normalizeForExactMatch(s.label) === nq;

  return suggestions.find(isExact("variant")) ?? suggestions.find(isExact("canonical"));
}

export function useHomeSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const router = useRouter();

  // Unique per mounted instance — HomeSearchHero and DesktopCompactHeader can
  // both be mounted at once, each with its own useHomeSearch(), so a
  // hardcoded id would collide and break aria-controls/aria-activedescendant.
  const listboxId = useId();

  const { suggestions } = useSearchSuggestions(query);
  const showDropdown = open && suggestions.length > 0;
  const activeDescendantId = activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined;

  useEffect(() => {
    if (suggestions.length > 0) setOpen(true);
  }, [suggestions.length]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setOpen(false);
      setActiveIndex(-1);
    }
  }, [query]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [suggestions]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    const exact = resolveExactSuggestion(q, suggestions);
    if (exact) {
      handleSelect(exact);
      return;
    }

    setOpen(false);
    router.push(`${ROUTES.RESULTS}?q=${encodeURIComponent(q)}`);
  }

  function handleSelect(s: SearchSuggestion) {
    setOpen(false);
    setActiveIndex(-1);
    if (s.type === "recipe") {
      router.push(ROUTES.RECIPE(s.slug));
      return;
    }
    // "canonical"/"canonical-parent" → broad catalog search (includes approved
    // variants). "variant"/"partial" → narrow search on the exact matched text.
    if (s.matchType === "canonical" || s.matchType === "canonical-parent") {
      router.push(`${ROUTES.RESULTS}?canonicalIngredient=${encodeURIComponent(s.canonicalName)}`);
    } else {
      router.push(`${ROUTES.RESULTS}?ingredient=${encodeURIComponent(s.searchTerm)}`);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showDropdown) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIndex]);
    }
    // Enter with nothing highlighted falls through to the form's native
    // submit, handled by handleSubmit (exact-match-first, then free text).
  }

  function handleWrapperBlur(e: React.FocusEvent<HTMLDivElement>) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return {
    query,
    setQuery,
    open,
    setOpen,
    activeIndex,
    suggestions,
    showDropdown,
    listboxId,
    activeDescendantId,
    handleSubmit,
    handleSelect,
    handleKeyDown,
    handleWrapperBlur,
  };
}
