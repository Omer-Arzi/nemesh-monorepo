import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";
import { LoadingStateStyle } from "./styles/LoadingStateStyle";

type Props = {
  label?: string;
  minHeight?: number | string;
  sx?: SxProps<Theme>;
};

export default function LoadingState({ label, minHeight = 200, sx }: Props) {
  return (
    <Box
      role="status"
      aria-label={label ?? "טוען..."}
      sx={{ ...LoadingStateStyle.root, minHeight, ...sx }}
    >
      <CircularProgress />
      {label && (
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      )}
    </Box>
  );
}
