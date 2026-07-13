"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants";
import type { SearchSuggestion } from "@/lib/api/services/suggestionsService";
import { useSearchSuggestions } from "./useSearchSuggestions";

export type HomeSearch = ReturnType<typeof useHomeSearch>;

export function useHomeSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const router = useRouter();

  const { suggestions } = useSearchSuggestions(query);
  const showDropdown = open && suggestions.length > 0;

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
    setOpen(false);
    router.push(`${ROUTES.RESULTS}?q=${encodeURIComponent(q)}`);
  }

  function handleSelect(s: SearchSuggestion) {
    setOpen(false);
    setActiveIndex(-1);
    if (s.type === "recipe") {
      router.push(ROUTES.RECIPE(s.slug));
    } else {
      router.push(`${ROUTES.RESULTS}?ingredient=${encodeURIComponent(s.canonicalName)}`);
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
    handleSubmit,
    handleSelect,
    handleKeyDown,
    handleWrapperBlur,
  };
}
