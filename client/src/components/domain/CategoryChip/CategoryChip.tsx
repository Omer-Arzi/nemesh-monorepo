"use client";

import Chip, { type ChipProps } from "@mui/material/Chip";
import NextLink from "next/link";
import { ROUTES } from "@/constants";
import type { Category } from "@/types/domain";

type Props = Omit<ChipProps, "label" | "onClick"> & {
  category: Category;
  selected?: boolean;
  onClick?: () => void;
};

export default function CategoryChip({
  category,
  selected = false,
  onClick,
  ...props
}: Props) {
  const chipProps: ChipProps = {
    label: category.name,
    color: selected ? "primary" : "default",
    variant: selected ? "filled" : "outlined",
    size: "small",
    ...props,
  };

  if (onClick) {
    return <Chip clickable onClick={onClick} {...chipProps} />;
  }

  return (
    <Chip
      clickable
      component={NextLink}
      href={ROUTES.CATEGORY(category.slug)}
      {...chipProps}
    />
  );
}
