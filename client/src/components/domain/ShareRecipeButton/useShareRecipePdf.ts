"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ShareRecipeStatus = "idle" | "preparing" | "ready" | "error";

type ShareOutcome = "shared" | "cancelled" | "blocked" | "failed";

type Options = {
  slug: string;
  title: string;
  /** Public page URL — shared instead of the file when the browser cannot share files. */
  recipeUrl: string;
};

/** Strips characters that are invalid in file names on common platforms. */
function toFileName(title: string): string {
  const safe = title.replace(/[\\/:*?"<>|]/g, " ").replace(/\s+/g, " ").trim();
  return `${safe || "recipe"}.pdf`;
}

function canShareFiles(): boolean {
  if (typeof navigator === "undefined" || typeof navigator.canShare !== "function") return false;
  // The check needs a real File; contents are irrelevant to it.
  return navigator.canShare({ files: [new File([], "recipe.pdf", { type: "application/pdf" })] });
}

async function runShare(data: ShareData): Promise<ShareOutcome> {
  try {
    await navigator.share(data);
    return "shared";
  } catch (error) {
    const name = error instanceof DOMException ? error.name : "";
    // The reader closed the share sheet — not an error.
    if (name === "AbortError") return "cancelled";
    // The browser refused because the tap that started this was too long ago.
    if (name === "NotAllowedError") return "blocked";
    return "failed";
  }
}

/**
 * Mobile "share this recipe" flow: fetch the recipe as a PDF from
 * `/api/recipes/[slug]/pdf` and hand it to the native share sheet
 * (`navigator.share` with a file), which on a phone offers Print, Save to
 * Files, WhatsApp, Mail and so on — no printer needed.
 *
 * Generating the PDF takes seconds, and browsers only allow `navigator.share`
 * shortly after a tap. When that window has closed by the time the file
 * arrives, the status becomes `"ready"` and the UI offers a second tap
 * (`confirm`), which carries the fresh user activation the share needs.
 *
 * Only the file (or, as a fallback, the bare link) is handed to the share sheet
 * — deliberately no `title` / `text`, so the message in WhatsApp, Mail etc. is
 * just the PDF with no added wording.
 *
 * Browsers that cannot share files still get the recipe's link shared, which
 * needs no fetch and so runs straight inside the tap.
 */
export function useShareRecipePdf({ slug, title, recipeUrl }: Options) {
  const [status, setStatus] = useState<ShareRecipeStatus>("idle");
  const fileRef = useRef<File | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const settle = useCallback((outcome: ShareOutcome) => {
    if (outcome === "blocked") setStatus("ready");
    else if (outcome === "failed") setStatus("error");
    else setStatus("idle");
  }, []);

  const start = useCallback(async () => {
    if (status === "preparing") return;

    // Already fetched on this page view: share straight away, inside the tap.
    if (fileRef.current) {
      settle(await runShare({ files: [fileRef.current] }));
      return;
    }

    if (!canShareFiles()) {
      settle(await runShare({ url: recipeUrl }));
      return;
    }

    setStatus("preparing");
    const controller = new AbortController();
    abortRef.current = controller;

    let file: File;
    try {
      const response = await fetch(`/api/recipes/${encodeURIComponent(slug)}/pdf`, {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`PDF request failed (${response.status})`);
      file = new File([await response.blob()], toFileName(title), { type: "application/pdf" });
    } catch {
      if (!controller.signal.aborted) setStatus("error");
      return;
    }

    fileRef.current = file;
    settle(await runShare({ files: [file] }));
  }, [status, slug, title, recipeUrl, settle]);

  /** Second tap after `status` became `"ready"`. */
  const confirm = useCallback(async () => {
    const file = fileRef.current;
    if (!file) return setStatus("idle");
    const outcome = await runShare({ files: [file] });
    setStatus(outcome === "failed" || outcome === "blocked" ? "error" : "idle");
  }, []);

  const dismiss = useCallback(() => setStatus("idle"), []);

  return { status, start, confirm, dismiss };
}
