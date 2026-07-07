import type { MetadataRoute } from "next";

function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://nemesh-food.com").replace(/\/$/, "");
}

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
