"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import NextLink from "next/link";
import type { Category } from "@/types/domain";
import { ROUTES } from "@/constants";
import { NemeshImage } from "@/components/shared";
import { FeaturedCategoryCardStyle } from "./FeaturedCategoryCard.style";

type Props = {
  category: Category;
};

export default function FeaturedCategoryCard({ category }: Props) {
  const label = category.menuName ?? category.name;

  return (
    <Box
      component={NextLink}
      href={ROUTES.CATEGORY(category.slug)}
      sx={FeaturedCategoryCardStyle.root}
    >
      {category.image ? (
        <NemeshImage
          image={category.image}
          alt={category.image.alt || label}
          fill
          sizes="200px"
          style={{ objectFit: "cover" }}
        />
      ) : (
        <Box sx={FeaturedCategoryCardStyle.fallback}>
          <CategoryOutlinedIcon fontSize="inherit" />
        </Box>
      )}

      <Box sx={FeaturedCategoryCardStyle.overlay}>
        <Typography component="span" sx={FeaturedCategoryCardStyle.label}>
          {label}
        </Typography>
      </Box>
    </Box>
  );
}
