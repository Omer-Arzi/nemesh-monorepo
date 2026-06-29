"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import type { ShirChallengeMonth } from "@/types/domain";
import { formatHebrewMonthLabel } from "../shirChallengeUtils";
import {
  PROGRESS_STATUS_LABELS,
  MONTHLY_CHALLENGE_STATUS_LABELS,
  ShirChallengeDefaults,
  ShirChallengeText,
} from "../ShirChallenge.consts";
import { ShirChallengeStatusPanelStyle as S } from "./ShirChallengeStatusPanel.style";

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  currentMonth: ShirChallengeMonth | null;
  previousMonth: ShirChallengeMonth | null;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ShirChallengeStatusPanel({ currentMonth, previousMonth }: Props) {
  const [expanded, setExpanded] = useState(true);

  const status = currentMonth?.monthlyChallengeStatus ?? "pending";
  const isActive = status === "active";
  const isNeutral = !isActive;
  const hasTwo = Boolean(previousMonth);

  const monthLabel = currentMonth?.monthStart
    ? formatHebrewMonthLabel(currentMonth.monthStart)
    : null;

  return (
    // ── Outer panel — one bordered accordion card ────────────────────────────
    <Box sx={S.panel}>

      {/* ── Header / trigger (always visible) ─────────────────────────── */}
      <Box
        component="button"
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
        sx={[S.header, isNeutral && S.headerNeutral]}
      >
        <Box sx={S.headerStart}>
          <Box component="span" sx={S.headerTitle}>
            {ShirChallengeText.statusPanelTitle}
          </Box>
          <Box component="span" sx={[S.statusChip, isNeutral && S.statusChipNeutral]}>
            {MONTHLY_CHALLENGE_STATUS_LABELS[status]}
          </Box>
        </Box>
        <KeyboardArrowDownIcon
          sx={{
            ...S.chevron,
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </Box>

      {/* ── Body (collapses) ─────────────────────────────────────────────── */}
      <Collapse in={expanded}>
        <Box sx={S.body}>
          <Box sx={S.cardRow}>

            {/* ── Current month card ─────────────────────────────────────── */}
            <Box sx={[S.card, S.currentCard, !hasTwo && S.currentCardAlone]}>
              <Box sx={S.cardBody}>
                {monthLabel && (
                  <Box component="span" sx={S.cardMonthLabel}>
                    {monthLabel}
                  </Box>
                )}

                {status === "pending" && (
                  <Box sx={{ typography: "body2", color: "text.secondary", lineHeight: 1.7 }}>
                    {currentMonth?.monthlyChallengeNote ?? ShirChallengeDefaults.pendingNote}
                  </Box>
                )}

                {status === "active" && currentMonth && (
                  <>
                    <Box sx={S.statRow}>
                      <Box sx={S.statBlock}>
                        <Box component="span" sx={S.statLabel}>
                          {ShirChallengeText.statusPanelLabelIngredient}
                        </Box>
                        <Box component="span" sx={[S.statValue, S.statValueIngredient]}>
                          {currentMonth.monthlyIngredientName ??
                            ShirChallengeDefaults.ingredientNameFallback}
                        </Box>
                      </Box>

                      {currentMonth.myProgressStatus && (
                        <Box sx={S.statBlock}>
                          <Box component="span" sx={S.statLabel}>
                            {ShirChallengeText.statusPanelLabelProgress}
                          </Box>
                          <Box component="span" sx={S.statValue}>
                            {PROGRESS_STATUS_LABELS[currentMonth.myProgressStatus]}
                          </Box>
                        </Box>
                      )}
                    </Box>

                    {currentMonth.monthlyChallengeNote && (
                      <Box sx={S.note}>{currentMonth.monthlyChallengeNote}</Box>
                    )}
                  </>
                )}

                {status === "skipped" && (
                  <Box sx={{ typography: "body2", color: "text.secondary", lineHeight: 1.7 }}>
                    {currentMonth?.monthlyChallengeNote ?? ShirChallengeDefaults.skippedNoteFallback}
                  </Box>
                )}
              </Box>
            </Box>

            {/* ── Previous month card (secondary) ────────────────────────── */}
            {previousMonth && (
              <Box sx={[S.card, S.prevCard]}>
                <Box sx={S.prevCardHeader}>
                  <Box component="span" sx={S.prevCardTitle}>
                    {ShirChallengeText.prevSectionTitle}
                  </Box>
                  <Box component="span" sx={S.prevChip}>
                    {MONTHLY_CHALLENGE_STATUS_LABELS[previousMonth.monthlyChallengeStatus]}
                  </Box>
                </Box>

                <Box sx={S.prevCardBody}>
                  <Box sx={S.prevRow}>
                    <Box component="span" sx={S.prevRowLabel}>
                      {ShirChallengeText.statusPanelLabelMonth}
                    </Box>
                    <Box component="span" sx={S.prevRowValue}>
                      {formatHebrewMonthLabel(previousMonth.monthStart)}
                    </Box>
                  </Box>

                  {previousMonth.monthlyIngredientName && (
                    <Box sx={S.prevRow}>
                      <Box component="span" sx={S.prevRowLabel}>
                        {ShirChallengeText.statusPanelLabelIngredient}
                      </Box>
                      <Box component="span" sx={S.prevRowValue}>
                        {previousMonth.monthlyIngredientName}
                      </Box>
                    </Box>
                  )}

                  {previousMonth.myProgressStatus && (
                    <Box sx={S.prevRow}>
                      <Box component="span" sx={S.prevRowLabel}>
                        {ShirChallengeText.statusPanelLabelProgress}
                      </Box>
                      <Box component="span" sx={S.prevRowValue}>
                        {PROGRESS_STATUS_LABELS[previousMonth.myProgressStatus]}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            )}

          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}
