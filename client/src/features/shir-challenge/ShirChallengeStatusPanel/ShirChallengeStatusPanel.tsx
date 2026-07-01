"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import type { ShirChallengeMonth } from "@/types/domain";
import ChallengeStatusCard from "../ChallengeStatusCard";
import {
  MONTHLY_CHALLENGE_STATUS_LABELS,
  ShirChallengeText,
} from "../ShirChallenge.consts";
import { ShirChallengeStatusPanelStyle as S } from "./ShirChallengeStatusPanel.style";

type Props = {
  currentMonth: ShirChallengeMonth | null;
  previousMonth: ShirChallengeMonth | null;
};

export default function ShirChallengeStatusPanel({ currentMonth, previousMonth }: Props) {
  const [expanded, setExpanded] = useState(true);

  const status = currentMonth?.monthlyChallengeStatus ?? "pending";
  const isActive = status === "active";
  const isNeutral = !isActive;
  const hasPrevious = Boolean(previousMonth);

  return (
    <Box sx={S.panel}>

      {/* ── Header / trigger ─────────────────────────────────────────────── */}
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

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <Collapse in={expanded}>
        <Box sx={S.body}>
          <Box sx={S.cardRow}>
            <ChallengeStatusCard
              variant="current"
              month={currentMonth}
              sx={!hasPrevious ? S.currentCardAlone : undefined}
            />
            {previousMonth && (
              <ChallengeStatusCard variant="previous" month={previousMonth} />
            )}
          </Box>
        </Box>
      </Collapse>

    </Box>
  );
}
