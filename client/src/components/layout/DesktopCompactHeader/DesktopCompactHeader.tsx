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
import { DesktopCompactHeaderStyle } from "./DesktopCompactHeader.style";
import { HomeSearchHeroText } from "@/features/home/HomeSearchHero/HomeSearchHero.consts";
import { SiteLogo } from "@/components/shared";

type Props = {
  /**
   * Controls header visibility.  When false the header is opacity-0 / visibility-hidden
   * with a smooth exit transition; when true it enters with the matching enter transition.
   * The component remains mounted at all times so state (search query) is preserved
   * across route changes and no entrance animation replays unnecessarily.
   */
  visible: boolean;
};

/**
 * Persistent desktop compact header — lives in AppShell so it spans all routes.
 *
 * Visible on every non-home page and on the homepage once the hero has scrolled past.
 * Hidden on the homepage while the hero is visible, with opacity/slide transitions.
 *
 * Desktop only: hidden below the md breakpoint via display:none.
 * Mobile navigation is handled by the AppBar hamburger + NavDrawer.
 */
export default function DesktopCompactHeader({ visible }: Props) {
  const search = useHomeSearch();
  const { setOpen } = search;

  // Clear the dropdown when the header hides so stale results don't flash on re-appearance.
  useEffect(() => {
    if (!visible) setOpen(false);
  }, [visible, setOpen]);

  return (
    <Box
      component="header"
      aria-hidden={!visible}
      sx={DesktopCompactHeaderStyle.root(visible)}
    >
      {/* Compact logo — RTL start (physical right) */}
      <Box
        component={NextLink}
        href={ROUTES.HOME}
        aria-label="Nemesh — דף הבית"
        tabIndex={visible ? 0 : -1}
        sx={DesktopCompactHeaderStyle.logoLink}
      >
        <SiteLogo variant="desktop" alt="" sx={DesktopCompactHeaderStyle.logo} />
      </Box>

      {/* Compact search — fills remaining width */}
      <Box
        component="form"
        onSubmit={search.handleSubmit}
        sx={DesktopCompactHeaderStyle.searchArea}
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
            sx={DesktopCompactHeaderStyle.searchField}
            slotProps={{
              htmlInput: {
                tabIndex: visible ? 0 : -1,
                role: "combobox",
                "aria-autocomplete": "list",
                "aria-expanded": search.showDropdown,
                "aria-controls": search.listboxId,
                "aria-activedescendant": search.activeDescendantId,
              },
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
              listboxId={search.listboxId}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
}
