import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSuggestions, type SearchSuggestion } from "@/lib/api/services/suggestionsService";
import { queryKeys } from "@/lib/query/keys";

const DEBOUNCE_MS = 300;
const MIN_LENGTH = 2;

export function useSearchSuggestions(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  const enabled = debouncedQuery.length >= MIN_LENGTH;

  const { data = [] } = useQuery<SearchSuggestion[]>({
    queryKey: queryKeys.suggestions.byQuery(debouncedQuery),
    queryFn: () => getSuggestions(debouncedQuery),
    enabled,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

  return {
    suggestions: enabled ? data : ([] as SearchSuggestion[]),
    isActive: enabled,
  };
}
