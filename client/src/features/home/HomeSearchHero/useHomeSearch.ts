"use client";

import { useState, useEffect, useId } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants";
import type { SearchSuggestion } from "@/lib/api/services/suggestionsService";
import type { RecommendedTag } from "@/types/domain";
import { useSearchSuggestions } from "./useSearchSuggestions";

export type HomeSearch = ReturnType<typeof useHomeSearch>;

type UseHomeSearchOptions = {
  /**
   * Editor-curated tags for the "recommended" state. Only consulted when
   * `mode === "hero"`. The compact-header instance never passes this, so it
   * can never enter recommended mode (D3).
   */
  recommendedTags?: RecommendedTag[];
  /**
   * "hero" enables the recommended-tags state (shown on focus + empty query).
   * "compact" (default) is byte-for-byte the pre-existing behavior.
   */
  mode?: "hero" | "compact";
};

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

export function useHomeSearch({ recommendedTags = [], mode = "compact" }: UseHomeSearchOptions = {}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  // Hero-only: whether the field currently holds focus, and whether the
  // recommended state was dismissed with Escape (D8) — cleared on blur or on
  // any query change.
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();

  // Unique per mounted instance — HomeSearchHero and DesktopCompactHeader can
  // both be mounted at once, each with its own useHomeSearch(), so a
  // hardcoded id would collide and break aria-controls/aria-activedescendant.
  const listboxId = useId();

  const { suggestions } = useSearchSuggestions(query);
  const showDropdown = open && suggestions.length > 0;

  const isHero = mode === "hero";
  // Recommended state: hero field focused, query is exactly empty (not the
  // typed "< 2 chars" threshold), not dismissed via Escape, and at least one
  // curated tag qualifies (zero-recipe tags were already dropped upstream).
  const isRecommendedOpen =
    isHero && focused && query.length === 0 && !dismissed && recommendedTags.length > 0;

  // The surface (SearchSuggestions Paper) is mounted in either mode.
  const isOpen = showDropdown || isRecommendedOpen;
  const optionCount = isRecommendedOpen ? recommendedTags.length : suggestions.length;
  const activeDescendantId = activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined;

  useEffect(() => {
    if (suggestions.length > 0) setOpen(true);
  }, [suggestions.length]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setOpen(false);
      setActiveIndex(-1);
    }
    // Any query change re-arms the recommended state after an Escape dismissal.
    setDismissed(false);
  }, [query]);

  // Clear the highlight whenever the typed result set changes so a stale index
  // never points at a row that moved or disappeared. Never applied in
  // recommended mode: its option list is static while the surface is open, and
  // `suggestions` there is an unrelated empty list — resetting on it would
  // wipe the arrow-key highlight the instant the user presses a key.
  useEffect(() => {
    if (isRecommendedOpen) return;
    setActiveIndex(-1);
  }, [suggestions, isRecommendedOpen]);

  // Note: no separate reset is needed when entering/leaving the recommended
  // state — every transition into or out of it also changes `query` (to or
  // from empty) or fires `handleWrapperBlur`/Escape, all of which already
  // clear `activeIndex`.

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

  function selectRecommendedTag(tag: RecommendedTag) {
    setOpen(false);
    setFocused(false);
    setActiveIndex(-1);
    // Stable tag identity — the tag-filter mode of the results view. Never ?q=.
    router.push(ROUTES.RESULTS_BY_TAG(tag.slug));
  }

  function handleFocus() {
    if (isHero) setFocused(true);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, optionCount - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      // Hero: stay dismissed while focus + empty query persist (D8).
      if (isRecommendedOpen) setDismissed(true);
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      if (isRecommendedOpen) {
        selectRecommendedTag(recommendedTags[activeIndex]);
      } else {
        handleSelect(suggestions[activeIndex]);
      }
    }
    // Enter with nothing highlighted: in typed mode it falls through to the
    // form's native submit (handleSubmit — exact-match-first, then free text);
    // in recommended mode the query is empty so handleSubmit is a no-op.
  }

  function handleWrapperBlur(e: React.FocusEvent<HTMLDivElement>) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setOpen(false);
      setActiveIndex(-1);
      setFocused(false);
      setDismissed(false);
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
    recommendedTags,
    isRecommendedOpen,
    isOpen,
    listboxId,
    activeDescendantId,
    handleSubmit,
    handleSelect,
    selectRecommendedTag,
    handleFocus,
    handleKeyDown,
    handleWrapperBlur,
  };
}
