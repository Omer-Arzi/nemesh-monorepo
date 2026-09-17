"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import SoupKitchenIcon from "@mui/icons-material/SoupKitchen";
import NextLink from "next/link";
import { ROUTES } from "@/constants";
import type { ShirChallengeMonth } from "@/types/domain";
import { SHIR_CHALLENGE_SLUG } from "@/features/shir-challenge/ShirChallenge.consts";
import { formatHebrewMonthLabel } from "@/features/shir-challenge/shirChallengeUtils";
import { NemeshImage } from "@/components/shared";
import { ShirChallengeMonthCardStyle } from "./ShirChallengeMonthCard.style";
import { ShirChallengeMonthCardText } from "./ShirChallengeMonthCard.consts";

type Props = {
  month: ShirChallengeMonth;
};

// Matched card, recipe has no photo — same meaning as RecipeCard's own
// "no image" fallback, so it reuses that icon/copy pairing.
const noImageFallback = (
  <Box sx={ShirChallengeMonthCardStyle.noImageState}>
    <RestaurantIcon sx={ShirChallengeMonthCardStyle.noImageIcon} />
    <Typography sx={ShirChallengeMonthCardStyle.noImageText}>
      {ShirChallengeMonthCardText.noImageCaption}
    </Typography>
  </Box>
);

export default function ShirChallengeMonthCard({ month }: Props) {
  const monthLabel = formatHebrewMonthLabel(month.monthStart);
  const { recipe } = month;

  if (recipe) {
    return (
      <Card sx={ShirChallengeMonthCardStyle.card}>
        <CardActionArea
          component={NextLink}
          href={ROUTES.RECIPE(recipe.slug)}
          sx={ShirChallengeMonthCardStyle.actionArea}
        >
          <Box sx={ShirChallengeMonthCardStyle.imageZone}>
            <NemeshImage
              image={recipe.image}
              fill
              sizes="240px"
              objectFit="cover"
              className="ShirChallengeMonthCard-image"
              fallback={noImageFallback}
            />
          </Box>

          <CardContent sx={ShirChallengeMonthCardStyle.content}>
            <Typography variant="subtitle1" component="h3" sx={ShirChallengeMonthCardStyle.title}>
              {recipe.title}
            </Typography>
            <Typography sx={ShirChallengeMonthCardStyle.caption}>{monthLabel}</Typography>
            {month.monthlyIngredientName && (
              <Typography sx={ShirChallengeMonthCardStyle.ingredientMeta}>
                {month.monthlyIngredientName}
              </Typography>
            )}
          </CardContent>
        </CardActionArea>
      </Card>
    );
  }

  // Current-month, unmatched: placeholder card, same shell and interactive
  // affordance, linking to the existing challenge page instead of a recipe.
  return (
    <Card sx={ShirChallengeMonthCardStyle.card}>
      <CardActionArea
        component={NextLink}
        href={ROUTES.TAG(SHIR_CHALLENGE_SLUG)}
        aria-label={ShirChallengeMonthCardText.placeholderAriaLabel(monthLabel)}
        sx={ShirChallengeMonthCardStyle.actionArea}
      >
        <Box sx={ShirChallengeMonthCardStyle.imageZone}>
          <Box sx={ShirChallengeMonthCardStyle.noImageState}>
            <SoupKitchenIcon sx={ShirChallengeMonthCardStyle.noImageIcon} />
            <Typography sx={ShirChallengeMonthCardStyle.noImageText}>
              {ShirChallengeMonthCardText.comingSoonImageCaption}
            </Typography>
          </Box>
        </Box>

        <CardContent sx={ShirChallengeMonthCardStyle.content}>
          <Typography variant="subtitle1" component="h3" sx={ShirChallengeMonthCardStyle.title}>
            {monthLabel}
          </Typography>
          <Typography sx={ShirChallengeMonthCardStyle.caption}>
            {ShirChallengeMonthCardText.comingSoonBodyCaption}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
