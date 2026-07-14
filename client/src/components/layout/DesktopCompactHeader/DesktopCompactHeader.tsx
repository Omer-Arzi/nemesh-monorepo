"use client";

import { useEffect, useRef } from "react";
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

  // TEMP DEBUG — layout bug investigation. Remove before commit.
  const rootRef = useRef<HTMLElement>(null);
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(`%c[layout-debug]%c DesktopCompactHeader render`, "color:#2196f3;font-weight:bold", "color:inherit", {
      t: Math.round(performance.now()),
      visibleProp: visible,
    });
    const raf = requestAnimationFrame(() => {
      const el = rootRef.current;
      if (!el) return;
      const cs = getComputedStyle(el);
      const className = el.className;
      // Cross-check: does a <style data-emotion> tag actually contain a rule
      // for every class on this element? If a class is present on the node
      // but its CSS text is missing from every emotion style tag, that class
      // is "logically applied" but visually inert — proof of a stale/missing
      // style-insertion bug rather than a wrong prop/state value.
      const emotionStyleTags = Array.from(
        document.querySelectorAll("style[data-emotion]")
      ) as HTMLStyleElement[];
      const allEmotionCss = emotionStyleTags.map((t) => t.textContent ?? "").join("\n");
      const classList = className.split(/\s+/).filter(Boolean);
      const classesMissingCss = classList.filter(
        (c) => c.startsWith("css-") && !allEmotionCss.includes(`.${c}`)
      );
      // eslint-disable-next-line no-console
      console.log(`%c[layout-debug]%c DesktopCompactHeader computed (post-paint)`, "color:#2196f3;font-weight:bold", "color:inherit", {
        visibleProp: visible,
        display: cs.display,
        position: cs.position,
        top: cs.top,
        opacity: cs.opacity,
        visibility: cs.visibility,
        transform: cs.transform,
        className,
        emotionStyleTagCount: emotionStyleTags.length,
        classesMissingCss,
      });
      if (classesMissingCss.length > 0) {
        // eslint-disable-next-line no-console
        console.warn(
          "[layout-debug] DesktopCompactHeader: class present on element but NO matching CSS rule found in any <style data-emotion> tag",
          classesMissingCss
        );
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [visible]);

  return (
    <Box
      ref={rootRef}
      data-debug="desktop-compact-header"
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
