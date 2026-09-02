import { NextResponse, type NextRequest } from "next/server";

/**
 * Marks the tag-filter results view (`/results?tag=<slug>`) as non-indexable.
 *
 * It is a non-canonical, link-only filtered view (like `?q=` / `?ingredient=`)
 * and must not compete with real content in search results. The other
 * `/results` modes are intentionally left untouched — they carry no `noindex`
 * today and this change must not alter that.
 *
 * `X-Robots-Tag: noindex` (an HTTP response header) is used rather than a
 * `robots` metadata export because `/results/page.tsx` is a client component
 * and cannot export `generateMetadata`.
 *
 * The matcher is scoped to `/results` exactly, so this runs on no other route.
 */
export function middleware(request: NextRequest): NextResponse {
  const response = NextResponse.next();

  if (request.nextUrl.searchParams.has("tag")) {
    response.headers.set("X-Robots-Tag", "noindex");
  }

  return response;
}

export const config = {
  matcher: "/results",
};
