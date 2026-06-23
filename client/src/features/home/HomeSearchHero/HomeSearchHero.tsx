"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import SearchIcon from "@mui/icons-material/Search";
import { ROUTES } from "@/constants";
import { HomeSearchHeroStyle } from "./HomeSearchHero.style";
import { HomeSearchHeroText } from "./HomeSearchHero.consts";

export default function HomeSearchHero() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`${ROUTES.RESULTS}?q=${encodeURIComponent(q)}`);
  }

  return (
    <Box component="section" sx={HomeSearchHeroStyle.root}>
      <Stack sx={HomeSearchHeroStyle.inner}>
        <Typography variant="h3" component="h1" sx={HomeSearchHeroStyle.headline}>
          {HomeSearchHeroText.headline}
        </Typography>

        <Typography variant="body1" sx={HomeSearchHeroStyle.subtitle}>
          {HomeSearchHeroText.subtitle}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={HomeSearchHeroStyle.form}>
          <TextField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={HomeSearchHeroText.placeholder}
            fullWidth
            sx={HomeSearchHeroStyle.searchField}
            slotProps={{
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
        </Box>
      </Stack>
    </Box>
  );
}
