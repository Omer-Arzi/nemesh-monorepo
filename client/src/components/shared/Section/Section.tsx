"use client";

import Box, { type BoxProps } from "@mui/material/Box";
import { SectionStyle } from "./styles/SectionStyle";

type Props = BoxProps & {
  component?: React.ElementType;
};

export default function Section({
  children,
  component = "section",
  sx,
  ...props
}: Props) {
  return (
    <Box
      component={component}
      sx={{ ...SectionStyle.root, ...sx }}
      {...props}
    >
      {children}
    </Box>
  );
}
