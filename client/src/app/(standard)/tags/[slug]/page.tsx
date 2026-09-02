import { redirect } from "next/navigation";
import { ROUTES } from "@/constants";

/**
 * The generic per-tag page was removed — most tags have no image, so its
 * large-image header read as broken. Tag browsing now lives in the results
 * view (`/results?tag=<slug>`), reached only via links.
 *
 * Any `/tags/<slug>` URL (shared links, old bookmarks, crawlers) silently
 * redirects to the homepage. `/tags/shir-challenge` is a static sibling
 * segment and keeps routing precedence over this dynamic one, so it is
 * unaffected.
 */
export default function TagSlugRedirect() {
  redirect(ROUTES.HOME);
}
