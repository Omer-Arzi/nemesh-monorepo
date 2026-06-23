"use client";

import { useState, useCallback, useEffect } from "react";
import { NemeshStorage } from "@/lib/storage/NemeshStorage";
import type { CookingModeState } from "./types";

const FEATURE = "cooking-mode";
const EXPIRES_IN_MS = 48 * 60 * 60 * 1000; // 48 hours

export type UseCookingModeReturn = {
  isActive: boolean;
  toggleActive: () => void;
  checkedIngredientKeys: string[];
  checkedStepKeys: string[];
  toggleIngredient: (key: string) => void;
  toggleStep: (key: string) => void;
  reset: () => void;
  ingredientProgress: { checked: number; total: number };
  stepProgress: { checked: number; total: number };
};

export function useCookingMode(
  recipeId: string,
  totalIngredients: number,
  totalSteps: number,
): UseCookingModeReturn {
  const [isActive, setIsActive] = useState(false);
  const [state, setState] = useState<CookingModeState | null>(null);

  useEffect(() => {
    const saved = NemeshStorage.get<CookingModeState>({ feature: FEATURE, key: recipeId });
    if (saved) setState(saved);
  }, [recipeId]);

  const persist = useCallback(
    (next: CookingModeState) => {
      NemeshStorage.set<CookingModeState>({
        feature: FEATURE,
        key: recipeId,
        value: next,
        expiresInMs: EXPIRES_IN_MS,
      });
      setState(next);
    },
    [recipeId],
  );

  const emptyState = useCallback(
    (): CookingModeState => ({
      recipeId,
      checkedIngredientKeys: [],
      checkedStepKeys: [],
      updatedAt: Date.now(),
    }),
    [recipeId],
  );

  const toggleActive = useCallback(() => setIsActive((v) => !v), []);

  const toggleIngredient = useCallback(
    (key: string) => {
      setState((prev) => {
        const current = prev ?? emptyState();
        const keys = current.checkedIngredientKeys.includes(key)
          ? current.checkedIngredientKeys.filter((k) => k !== key)
          : [...current.checkedIngredientKeys, key];
        const next: CookingModeState = { ...current, checkedIngredientKeys: keys, updatedAt: Date.now() };
        NemeshStorage.set<CookingModeState>({
          feature: FEATURE,
          key: recipeId,
          value: next,
          expiresInMs: EXPIRES_IN_MS,
        });
        return next;
      });
    },
    [recipeId, emptyState],
  );

  const toggleStep = useCallback(
    (key: string) => {
      setState((prev) => {
        const current = prev ?? emptyState();
        const keys = current.checkedStepKeys.includes(key)
          ? current.checkedStepKeys.filter((k) => k !== key)
          : [...current.checkedStepKeys, key];
        const next: CookingModeState = { ...current, checkedStepKeys: keys, updatedAt: Date.now() };
        NemeshStorage.set<CookingModeState>({
          feature: FEATURE,
          key: recipeId,
          value: next,
          expiresInMs: EXPIRES_IN_MS,
        });
        return next;
      });
    },
    [recipeId, emptyState],
  );

  const reset = useCallback(() => {
    NemeshStorage.remove({ feature: FEATURE, key: recipeId });
    setState(null);
  }, [recipeId]);

  return {
    isActive,
    toggleActive,
    checkedIngredientKeys: state?.checkedIngredientKeys ?? [],
    checkedStepKeys: state?.checkedStepKeys ?? [],
    toggleIngredient,
    toggleStep,
    reset,
    ingredientProgress: {
      checked: state?.checkedIngredientKeys.length ?? 0,
      total: totalIngredients,
    },
    stepProgress: {
      checked: state?.checkedStepKeys.length ?? 0,
      total: totalSteps,
    },
  };
}
