"use client";

import { useEffect } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import NextLink from "next/link";
import { ROUTES } from "@/constants";
import { SearchSuggestions } from "@/features/home/SearchSuggestions";
import { useHomeSearch } from "@/features/home/HomeSearchHero/useHomeSearch";
import { HomeStickyHeaderStyle } from "./HomeStickyHeader.style";
import { HomeSearchHeroText } from "@/features/home/HomeSearchHero/HomeSearchHero.consts";
import { SiteLogo } from "@/components/shared";

type Props = {
  visible: boolean;
};

export default function HomeStickyHeader({ visible }: Props) {
  const search = useHomeSearch();

  // Clear the dropdown when the header hides so stale results don't flash on re-appearance.
  useEffect(() => {
    if (!visible) search.setOpen(false);
  }, [visible, search.setOpen]);

  return (
    <Box
      component="header"
      aria-hidden={!visible}
      sx={HomeStickyHeaderStyle.root(visible)}
    >
      {/* Compact logo — RTL start (physical right) */}
      <Box
        component={NextLink}
        href={ROUTES.HOME}
        aria-label="Nemesh — דף הבית"
        tabIndex={visible ? 0 : -1}
        sx={HomeStickyHeaderStyle.logoLink}
      >
        <SiteLogo variant="desktop" alt="" sx={HomeStickyHeaderStyle.logo} />
      </Box>

      {/* Compact search — fills remaining width */}
      <Box
        component="form"
        onSubmit={search.handleSubmit}
        sx={HomeStickyHeaderStyle.searchArea}
      >
        <Box onBlur={search.handleWrapperBlur} sx={{ position: "relative" }}>
          <TextField
            value={search.query}
            onChange={(e) => search.setQuery(e.target.value)}
            onKeyDown={search.handleKeyDown}
            placeholder={HomeSearchHeroText.placeholder}
            size="small"
            fullWidth
            autoComplete="off"
            sx={HomeStickyHeaderStyle.searchField}
            slotProps={{
              htmlInput: { tabIndex: visible ? 0 : -1 },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "text.disabled", fontSize: "1.1rem" }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          {search.showDropdown && (
            <SearchSuggestions
              suggestions={search.suggestions}
              activeIndex={search.activeIndex}
              onSelect={search.handleSelect}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
}
