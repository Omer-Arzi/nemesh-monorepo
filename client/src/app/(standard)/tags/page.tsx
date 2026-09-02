import { redirect } from "next/navigation";
import { ROUTES } from "@/constants";

/**
 * There is no tags index. Bare `/tags` silently redirects to the homepage,
 * consistent with every `/tags/<slug>` URL (see `[slug]/page.tsx`).
 */
export default function TagsIndexRedirect() {
  redirect(ROUTES.HOME);
}
