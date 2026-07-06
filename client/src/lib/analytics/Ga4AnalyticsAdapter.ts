/*
 * Ga4AnalyticsAdapter
 *
 * This is the only place in the codebase that may reference window.gtag,
 * GA4 event names, or GA4 parameter shapes. All other code calls the
 * semantic methods below.
 *
 * ── Configuration ─────────────────────────────────────────────────────────────
 *
 *   NEXT_PUBLIC_GA_MEASUREMENT_ID        GA4 Measurement ID (e.g. G-XXXXXXXXXX)
 *   NEXT_PUBLIC_ENABLE_ANALYTICS         Must be "true" to activate tracking
 *   NEXT_PUBLIC_ANALYTICS_ALLOWED_HOSTS  Comma-separated production hostnames,
 *                                        e.g. "nemesh.co.il,www.nemesh.co.il"
 *
 * Analytics fire only when ALL conditions are true:
 *   • Running in the browser (window defined)
 *   • NODE_ENV === "production"
 *   • NEXT_PUBLIC_ENABLE_ANALYTICS === "true"
 *   • NEXT_PUBLIC_GA_MEASUREMENT_ID is defined
 *   • window.gtag is a function
 *   • window.location.hostname is in NEXT_PUBLIC_ANALYTICS_ALLOWED_HOSTS
 *
 * ── Events sent ───────────────────────────────────────────────────────────────
 *
 *   page_view           generic page visit
 *   recipe_view         recipe detail page opened
 *   category_view       category browse page opened
 *   cooking_mode_start  user entered cooking mode
 *   cooking_mode_exit   user left cooking mode
 *
 * ── Custom dimensions to register in GA4 ──────────────────────────────────────
 *
 * Go to GA4 > Admin > Custom definitions > Custom dimensions and register:
 *
 *   Name             Scope   Parameter name
 *   ─────────────────────────────────────────
 *   Page ID          Event   page_id
 *   Page Name        Event   page_name
 *   Page Path        Event   page_path
 *   Recipe ID        Event   recipe_id
 *   Recipe Name      Event   recipe_name
 *   Recipe Slug      Event   recipe_slug
 *   Category ID      Event   category_id
 *   Category Name    Event   category_name
 *   Category Slug    Event   category_slug
 */

// Augment the browser Window so TypeScript accepts window.gtag.
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

// ── Parameter types ────────────────────────────────────────────────────────────

export type PageViewParams = {
  page_id: string;
  page_name: string;
  page_path?: string;
};

export type RecipeViewParams = {
  recipe_id: string | number;
  recipe_name: string;
  recipe_slug?: string;
};

export type CategoryViewParams = {
  category_id: string | number;
  category_name: string;
  category_slug?: string;
};

export type CookingModeParams = {
  recipe_id: string | number;
  recipe_name: string;
};

// ── Adapter ────────────────────────────────────────────────────────────────────

class Ga4AnalyticsAdapter {
  private isEnabled(): boolean {
    if (typeof window === "undefined") return false;
    if (process.env.NODE_ENV !== "production") return false;
    if (process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== "true") return false;
    if (!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) return false;
    if (typeof window.gtag !== "function") return false;

    const allowedHosts = (process.env.NEXT_PUBLIC_ANALYTICS_ALLOWED_HOSTS ?? "")
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean);

    if (allowedHosts.length > 0 && !allowedHosts.includes(window.location.hostname)) {
      return false;
    }

    return true;
  }

  private send(eventName: string, params: Record<string, unknown>): void {
    if (!this.isEnabled()) return;
    window.gtag("event", eventName, params);
  }

  trackPageView(params: PageViewParams): void {
    this.send("page_view", {
      page_id: params.page_id,
      page_name: params.page_name,
      ...(params.page_path !== undefined && { page_path: params.page_path }),
    });
  }

  trackRecipeView(params: RecipeViewParams): void {
    this.send("recipe_view", {
      recipe_id: String(params.recipe_id),
      recipe_name: params.recipe_name,
      ...(params.recipe_slug !== undefined && { recipe_slug: params.recipe_slug }),
    });
  }

  trackCategoryView(params: CategoryViewParams): void {
    this.send("category_view", {
      category_id: String(params.category_id),
      category_name: params.category_name,
      ...(params.category_slug !== undefined && { category_slug: params.category_slug }),
    });
  }

  trackCookingModeStart(params: CookingModeParams): void {
    this.send("cooking_mode_start", {
      recipe_id: String(params.recipe_id),
      recipe_name: params.recipe_name,
    });
  }

  trackCookingModeExit(params: CookingModeParams): void {
    this.send("cooking_mode_exit", {
      recipe_id: String(params.recipe_id),
      recipe_name: params.recipe_name,
    });
  }
}

// Singleton — import { analytics } from "@/lib/analytics" throughout the app.
export const analytics = new Ga4AnalyticsAdapter();
