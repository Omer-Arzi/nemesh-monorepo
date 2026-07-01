"use client";

import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ShirChallengeMonth } from "@/types/domain";
import { formatHebrewMonthLabel } from "../shirChallengeUtils";
import {
  PROGRESS_STATUS_LABELS,
  ShirChallengeDefaults,
  ShirChallengeText,
} from "../ShirChallenge.consts";
import { ChallengeStatusCardStyle as S } from "./styles/ChallengeStatusCardStyle";

type Props = {
  variant: "current" | "previous";
  month: ShirChallengeMonth | null;
  sx?: SxProps<Theme>;
};

export default function ChallengeStatusCard({ variant, month, sx }: Props) {
  const isCurrent = variant === "current";
  const status = month?.monthlyChallengeStatus ?? "pending";
  const isActive = status === "active";

  // Badge text is driven by card context, not by the stored challenge status.
  const badge = isCurrent ? ShirChallengeDefaults.badgeText : ShirChallengeText.prevSectionTitle;

  const monthLabel = month?.monthStart ? formatHebrewMonthLabel(month.monthStart) : null;

  // Ingredient shown when: active (current or previous) or previous card with any ingredient.
  const ingredient =
    month?.monthlyIngredientName ??
    (isCurrent && isActive ? ShirChallengeDefaults.ingredientNameFallback : null);

  // Progress label only when a progress status exists.
  const progressLabel = month?.myProgressStatus
    ? PROGRESS_STATUS_LABELS[month.myProgressStatus]
    : null;

  // Message replaces the ingredient block for pending/skipped on the current card.
  const message: string | null =
    isCurrent && status === "pending"
      ? (month?.monthlyChallengeNote ?? ShirChallengeDefaults.pendingNote)
      : isCurrent && status === "skipped"
      ? (month?.monthlyChallengeNote ?? ShirChallengeDefaults.skippedNoteFallback)
      : null;

  // Note is shown below the ingredient for active current cards only.
  const note =
    isCurrent && isActive && month?.monthlyChallengeNote
      ? month.monthlyChallengeNote
      : null;

  return (
    <Box
      sx={[
        S.card,
        isCurrent ? S.currentCard : S.previousCard,
        isCurrent && isActive && S.currentCardActive,
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {/* Context badge */}
      <Box component="span" sx={[S.badge, isCurrent && S.badgeCurrent]}>
        {badge}
      </Box>

      {/* חודש: יולי */}
      {monthLabel && (
        <Box sx={S.row}>
          <Box component="span" sx={S.rowLabel}>חודש: </Box>
          <Box component="span" sx={S.rowValue}>{monthLabel}</Box>
        </Box>
      )}

      {/* חומר גלם: סלק / מחכים לחומר הגלם של שיר. */}
      {(ingredient !== null || message !== null) && (
        <Box sx={S.row}>
          <Box component="span" sx={S.rowLabel}>חומר גלם: </Box>
          <Box component="span" sx={[S.rowValue, S.rowValueIngredient]}>
            {ingredient ?? message}
          </Box>
        </Box>
      )}

      {/* סטטוס: הוכן */}
      {progressLabel && (
        <Box sx={S.row}>
          <Box component="span" sx={S.rowLabel}>סטטוס: </Box>
          <Box component="span" sx={S.rowValue}>{progressLabel}</Box>
        </Box>
      )}

      {/* Free-text note (active current card only) */}
      {note && <Box sx={S.note}>{note}</Box>}
    </Box>
  );
}
