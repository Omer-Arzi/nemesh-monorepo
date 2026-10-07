import { NextResponse, type NextRequest } from "next/server";
import { getRecipeBySlug } from "@/lib/api/services/recipeService";
import { renderUrlToPdf } from "@/lib/pdf/renderRecipePdf";
import { getSiteUrl } from "@/lib/seo";
import { ROUTES } from "@/constants";

// Headless Chromium needs the Node runtime, and a cold start plus a render can
// outlast the default function timeout.
export const runtime = "nodejs";
export const maxDuration = 30;

// Each render launches a browser, so bound how many run at once per instance.
// Over the limit the client gets a retryable 503 instead of exhausting memory.
const MAX_CONCURRENT_RENDERS = 2;
let activeRenders = 0;

/**
 * Origin the headless browser loads the print page from.
 *
 * It must be the deployment serving this request (a preview deploy has a print
 * route that production does not yet), but never an arbitrary host taken from
 * the request: only the configured site, Vercel's own deployment hosts, and
 * localhost are accepted.
 */
function resolveRenderOrigin(request: NextRequest): string {
  const requestOrigin = request.nextUrl.origin;
  const { hostname } = request.nextUrl;

  const allowedHosts = new Set(
    [
      new URL(getSiteUrl()).hostname,
      process.env.VERCEL_URL,
      process.env.VERCEL_BRANCH_URL,
      process.env.VERCEL_PROJECT_PRODUCTION_URL,
      "localhost",
      "127.0.0.1",
    ].filter((host): host is string => Boolean(host)),
  );

  return allowedHosts.has(hostname) ? requestOrigin : getSiteUrl();
}

/** `Content-Disposition` with an RFC 5987 filename so Hebrew titles survive. */
function contentDisposition(title: string): string {
  const safe = title.replace(/[\\/:*?"<>|]/g, " ").replace(/\s+/g, " ").trim() || "recipe";
  return `inline; filename="recipe.pdf"; filename*=UTF-8''${encodeURIComponent(`${safe}.pdf`)}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;

  const recipe = await getRecipeBySlug(slug).catch(() => undefined);
  if (recipe === undefined) {
    return NextResponse.json({ error: "Recipe lookup failed" }, { status: 502 });
  }
  if (!recipe) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }

  if (activeRenders >= MAX_CONCURRENT_RENDERS) {
    return NextResponse.json(
      { error: "Busy, try again shortly" },
      { status: 503, headers: { "Retry-After": "5" } },
    );
  }

  activeRenders += 1;
  try {
    // Preview deployments sit behind Vercel Deployment Protection; the render
    // loads this deployment's own URL, so it presents the automation bypass
    // secret when one is configured.
    const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
    const pdf = await renderUrlToPdf(
      `${resolveRenderOrigin(request)}${ROUTES.RECIPE(encodeURIComponent(slug))}/print`,
      bypassSecret ? { extraHeaders: { "x-vercel-protection-bypass": bypassSecret } } : {},
    );

    return new Response(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": contentDisposition(recipe.title),
        // Short shared-cache window: repeat shares are instant and a burst of
        // requests for one recipe renders once, while a recipe edit still
        // reaches the PDF within minutes.
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error("[recipe-pdf] render failed", error);
    return NextResponse.json({ error: "PDF render failed" }, { status: 500 });
  } finally {
    activeRenders -= 1;
  }
}
