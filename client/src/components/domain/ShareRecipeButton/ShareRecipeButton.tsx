"use client";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Snackbar from "@mui/material/Snackbar";
import IosShareOutlinedIcon from "@mui/icons-material/IosShareOutlined";
import type { SxProps, Theme } from "@mui/material/styles";
import { ShareRecipeButtonStyle } from "./styles/ShareRecipeButtonStyle";
import { ShareRecipeButtonText } from "./ShareRecipeButton.consts";
import { useShareRecipePdf } from "./useShareRecipePdf";

type Props = {
  slug: string;
  title: string;
  /** Public page URL, shared in place of the file where files can't be shared. */
  recipeUrl: string;
  sx?: SxProps<Theme>;
};

/**
 * Phone replacement for `PrintRecipeButton`: shares the recipe as a PDF through
 * the device's native share sheet (which includes Print and Save to Files)
 * instead of calling `window.print()`, which does nothing useful on a phone
 * without a printer. Renders the same pill as the print control.
 */
export default function ShareRecipeButton({ slug, title, recipeUrl, sx }: Props) {
  const { status, start, confirm, dismiss } = useShareRecipePdf({ slug, title, recipeUrl });
  const preparing = status === "preparing";

  return (
    <>
      <Button
        type="button"
        variant="outlined"
        color="primary"
        size="small"
        disabled={preparing}
        aria-busy={preparing}
        startIcon={
          preparing ? (
            <CircularProgress size={16} sx={ShareRecipeButtonStyle.progress} />
          ) : (
            <IosShareOutlinedIcon />
          )
        }
        onClick={() => void start()}
        sx={[ShareRecipeButtonStyle.root, ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {preparing ? ShareRecipeButtonText.preparing : ShareRecipeButtonText.label}
      </Button>

      <Dialog open={status === "ready"} onClose={dismiss} aria-labelledby="share-recipe-ready-title">
        <DialogTitle id="share-recipe-ready-title">{ShareRecipeButtonText.readyTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>{ShareRecipeButtonText.readyBody}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={dismiss}>{ShareRecipeButtonText.readyCancel}</Button>
          <Button variant="contained" onClick={() => void confirm()} autoFocus>
            {ShareRecipeButtonText.readyConfirm}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={status === "error"}
        autoHideDuration={6000}
        onClose={dismiss}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" variant="filled" onClose={dismiss}>
          {ShareRecipeButtonText.error}
        </Alert>
      </Snackbar>
    </>
  );
}
