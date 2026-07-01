"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import SearchIcon from "@mui/icons-material/Search";
import type { Image } from "@/types/domain";
import { NemeshImage, FreckleDust } from "@/components/shared";
import { ROUTES } from "@/constants";
import type { SearchSuggestion } from "@/lib/api/services/suggestionsService";
import { SearchSuggestions } from "@/features/home/SearchSuggestions";
import { useSearchSuggestions } from "./useSearchSuggestions";
import { HomeSearchHeroStyle } from "./HomeSearchHero.style";
import { HomeSearchHeroText } from "./HomeSearchHero.consts";

type Props = {
  title?: string | null;
  subtitle?: string | null;
  backgroundImage?: Image | null;
};

export default function HomeSearchHero({ title, subtitle, backgroundImage }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const router = useRouter();

  const { suggestions } = useSearchSuggestions(query);
  const showDropdown = open && suggestions.length > 0;

  const headline = title ?? HomeSearchHeroText.headline;
  const subtitleText = subtitle ?? HomeSearchHeroText.subtitle;
  const hasImage = Boolean(backgroundImage);

  // Open dropdown when suggestions arrive; close when query is too short.
  useEffect(() => {
    if (suggestions.length > 0) setOpen(true);
  }, [suggestions.length]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setOpen(false);
      setActiveIndex(-1);
    }
  }, [query]);

  // Reset active index whenever the suggestion list changes.
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
    // Close only when focus leaves the entire wrapper (not just moving to the dropdown).
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <Box component="section" sx={hasImage ? HomeSearchHeroStyle.rootWithImage : HomeSearchHeroStyle.root}>
      {hasImage && backgroundImage && (
        <NemeshImage
          image={backgroundImage}
          fill
          objectFit="cover"
          objectPosition="center"
          sizes="100vw"
          priority
        />
      )}
      {!hasImage && <FreckleDust placement="top-right" density="medium" />}
      {!hasImage && <FreckleDust placement="bottom-left" density="low" />}

      <Stack sx={[HomeSearchHeroStyle.inner, hasImage && HomeSearchHeroStyle.innerOnImage]}>
        <Typography variant="h3" component="h1" sx={HomeSearchHeroStyle.headline}>
          {headline}
        </Typography>

        <Typography variant="body1" sx={HomeSearchHeroStyle.subtitle}>
          {subtitleText}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={HomeSearchHeroStyle.form}>
          <Box sx={HomeSearchHeroStyle.searchWrapper} onBlur={handleWrapperBlur}>
            <TextField
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={HomeSearchHeroText.placeholder}
              fullWidth
              autoComplete="off"
              sx={HomeSearchHeroStyle.searchField}
              slotProps
              ={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "text.disabled" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        sx={HomeSearchHeroStyle.submitButton}
                      >
                        {HomeSearchHeroText.submitButton}
                      </Button>
                    </InputAdornment>
                  ),
                },
              }}
            />

            {showDropdown && (
              <SearchSuggestions
                suggestions={suggestions}
                activeIndex={activeIndex}
                onSelect={handleSelect}
              />
            )}
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}
