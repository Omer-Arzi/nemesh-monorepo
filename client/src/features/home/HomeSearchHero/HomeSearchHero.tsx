"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import SearchIcon from "@mui/icons-material/Search";
import type { Image } from "@/types/domain";
import { NemeshImage, FreckleDust, SiteLogo } from "@/components/shared";
import { SearchSuggestions } from "@/features/home/SearchSuggestions";
import { useHomeSearch } from "./useHomeSearch";
import { HomeSearchHeroStyle } from "./HomeSearchHero.style";
import { HomeSearchHeroText } from "./HomeSearchHero.consts";

type Props = {
  title?: string | null;
  subtitle?: string | null;
  backgroundImage?: Image | null;
};

export default function HomeSearchHero({ title, subtitle, backgroundImage }: Props) {
  const search = useHomeSearch();

  const headline = title ?? HomeSearchHeroText.headline;
  const subtitleText = subtitle ?? HomeSearchHeroText.subtitle;
  const hasImage = Boolean(backgroundImage);

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
        {/* Desktop-only hero logo — desktop navbar is hidden on homepage */}
        <SiteLogo variant="desktop" alt="" sx={HomeSearchHeroStyle.heroLogo(hasImage)} />

        <Typography variant="h3" component="h1" sx={HomeSearchHeroStyle.headline}>
          {headline}
        </Typography>

        <Typography variant="body1" sx={HomeSearchHeroStyle.subtitle}>
          {subtitleText}
        </Typography>

        <Box component="form" onSubmit={search.handleSubmit} sx={HomeSearchHeroStyle.form}>
          <Box sx={HomeSearchHeroStyle.searchWrapper} onBlur={search.handleWrapperBlur}>
            <TextField
              value={search.query}
              onChange={(e) => search.setQuery(e.target.value)}
              onKeyDown={search.handleKeyDown}
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

            {search.showDropdown && (
              <SearchSuggestions
                suggestions={search.suggestions}
                activeIndex={search.activeIndex}
                onSelect={search.handleSelect}
              />
            )}
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}
