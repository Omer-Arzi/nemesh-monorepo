import type { Browser } from "puppeteer-core";

/**
 * Renders a URL to PDF with headless Chromium, honouring the page's own
 * `@page` rules (size, margins and the repeating footer margin boxes) — so the
 * file is the same document the Print button produces.
 *
 * Browser source:
 *   - Production (Vercel / AWS Lambda): `@sparticuz/chromium`, a serverless
 *     build of Chromium. Fonts are not installed on the host; the print
 *     document's Heebo is self-hosted by next/font and loads from the site.
 *   - Local development: a Chrome install, from `CHROME_EXECUTABLE_PATH` or the
 *     default macOS / Linux locations.
 */

const LOCAL_CHROME_PATHS = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
];

const NAVIGATION_TIMEOUT_MS = 20_000;

const isServerless = () => Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

async function launchBrowser(): Promise<Browser> {
  const puppeteer = (await import("puppeteer-core")).default;

  if (isServerless()) {
    const chromium = (await import("@sparticuz/chromium")).default;
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  const { existsSync } = await import("node:fs");
  const executablePath =
    process.env.CHROME_EXECUTABLE_PATH ?? LOCAL_CHROME_PATHS.find((p) => existsSync(p));
  if (!executablePath) {
    throw new Error(
      "No local Chrome found for PDF rendering. Set CHROME_EXECUTABLE_PATH to a Chrome/Chromium binary.",
    );
  }
  return puppeteer.launch({ executablePath, headless: true });
}

export async function renderUrlToPdf(
  url: string,
  options: { extraHeaders?: Record<string, string> } = {},
): Promise<Uint8Array> {
  const targetOrigin = new URL(url).origin;
  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();
    if (options.extraHeaders) await page.setExtraHTTPHeaders(options.extraHeaders);

    // The root layout carries analytics and speed-insights scripts. A render
    // is not a visit, so refuse anything that could report one: every
    // cross-origin script/network call and anything under `/_vercel/`. Images
    // and fonts (same- or cross-origin) are untouched.
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      const type = request.resourceType();
      const requestUrl = request.url();
      const sameOrigin = requestUrl.startsWith(targetOrigin);
      const blockedType =
        type === "script" || type === "xhr" || type === "fetch" || type === "ping" || type === "other";
      if (requestUrl.includes("/_vercel/") || (!sameOrigin && blockedType)) {
        void request.abort();
      } else {
        void request.continue();
      }
    });

    const response = await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: NAVIGATION_TIMEOUT_MS,
    });
    if (!response || !response.ok()) {
      throw new Error(`Print page responded with ${response?.status() ?? "no response"}`);
    }

    await page.evaluate(() => document.fonts.ready);
    await page.emulateMediaType("print");

    // `preferCSSPageSize` makes the page's own `@page` size/margins win, and
    // `printBackground` keeps the colour fills (print-color-adjust: exact).
    return await page.pdf({ preferCSSPageSize: true, printBackground: true });
  } finally {
    await browser.close();
  }
}
