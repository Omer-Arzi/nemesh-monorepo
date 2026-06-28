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

  return (
    <Box sx={[S.root, isNeutral && S.rootNeutral]}>
      {/* ── Collapsible header ── */}
      <Box
        component="button"
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
        sx={[S.header, isNeutral && S.headerNeutral]}
      >
        <Box sx={S.titleGroup}>
          <Box component="span" sx={S.title}>
            {ShirChallengeText.statusPanelTitle}
          </Box>
          <Box component="span" sx={[S.statusChip, isNeutral && S.statusChipNeutral]}>
            {MONTHLY_CHALLENGE_STATUS_LABELS[status]}
          </Box>
        </Box>
        <KeyboardArrowDownIcon
          sx={{ ...S.chevron, transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </Box>

      {/* ── Expandable body ── */}
      <Collapse in={expanded}>
        <Box sx={[S.body, isNeutral && S.bodyNeutral]}>
          {status === "pending" && (
            <Box sx={{ typography: "body2", color: "text.secondary", lineHeight: 1.7 }}>
              {currentMonth?.monthlyChallengeNote ?? ShirChallengeDefaults.pendingNote}
            </Box>
          )}

          {status === "active" && currentMonth && (
            <>
              <Box sx={S.row}>
                <Box component="span" sx={S.rowLabel}>
                  {ShirChallengeText.statusPanelLabelMonth}
                </Box>
                <Box component="span" sx={S.rowValue}>
                  {formatHebrewMonthLabel(currentMonth.monthStart)}
                </Box>
              </Box>

              <Box sx={S.row}>
                <Box component="span" sx={S.rowLabel}>
                  {ShirChallengeText.statusPanelLabelIngredient}
                </Box>
                <Box component="span" sx={S.rowValue}>
                  {currentMonth.monthlyIngredientName ?? ShirChallengeDefaults.ingredientNameFallback}
                </Box>
              </Box>

              {currentMonth.myProgressStatus && (
                <Box sx={S.row}>
                  <Box component="span" sx={S.rowLabel}>
                    {ShirChallengeText.statusPanelLabelProgress}
                  </Box>
                  <Box component="span" sx={S.rowValue}>
                    {PROGRESS_STATUS_LABELS[currentMonth.myProgressStatus]}
                  </Box>
                </Box>
              )}

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

          {previousMonth && (
            <Box sx={S.prevSection}>
              <Box component="span" sx={S.prevTitle}>
                {ShirChallengeText.prevSectionTitle}
              </Box>

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

              <Box sx={S.prevRow}>
                <Box component="span" sx={S.prevRowLabel}>סטטוס</Box>
                <Box component="span" sx={S.prevChip}>
                  {MONTHLY_CHALLENGE_STATUS_LABELS[previousMonth.monthlyChallengeStatus]}
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}
