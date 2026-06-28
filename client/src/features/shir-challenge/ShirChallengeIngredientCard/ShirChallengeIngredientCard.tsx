"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ShirChallengePage } from "@/types/domain";
import { PROGRESS_STATUS_LABELS, ShirChallengeText } from "../ShirChallenge.consts";
import { ShirChallengeIngredientCardStyle } from "./ShirChallengeIngredientCard.style";

type Props = Pick<
  ShirChallengePage,
  | "monthlyIngredientName"
  | "monthlyIngredientDescription"
  | "monthLabel"
  | "myProgressStatus"
>;

export default function ShirChallengeIngredientCard({
  monthlyIngredientName,
  monthlyIngredientDescription,
  monthLabel,
  myProgressStatus,
}: Props) {
  if (!monthlyIngredientName) return null;

  return (
    <Box sx={ShirChallengeIngredientCardStyle.root}>
      <Box sx={ShirChallengeIngredientCardStyle.header}>
        <Typography sx={ShirChallengeIngredientCardStyle.headerLabel}>
          {ShirChallengeText.ingredientCardHeader}
        </Typography>
        {monthLabel && (
          <Box component="span" sx={ShirChallengeIngredientCardStyle.monthChip}>
            {monthLabel}
          </Box>
        )}
      </Box>

      <Typography variant="h5" component="h3" sx={ShirChallengeIngredientCardStyle.ingredientName}>
        {monthlyIngredientName}
      </Typography>

      {monthlyIngredientDescription && (
        <Typography variant="body2" sx={ShirChallengeIngredientCardStyle.description}>
          {monthlyIngredientDescription}
        </Typography>
      )}

      {myProgressStatus && (
        <Box component="span" sx={ShirChallengeIngredientCardStyle.statusChip}>
          {PROGRESS_STATUS_LABELS[myProgressStatus]}
        </Box>
      )}
    </Box>
  );
}
