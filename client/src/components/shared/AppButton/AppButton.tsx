"use client";

import Button, { type ButtonProps } from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

type Props = ButtonProps & {
  loading?: boolean;
};

export default function AppButton({
  loading = false,
  disabled,
  children,
  startIcon,
  ...props
}: Props) {
  return (
    <Button
      disabled={disabled ?? loading}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : startIcon}
      {...props}
    >
      {children}
    </Button>
  );
}
