"use client";

import createCache from "@emotion/cache";
import { useServerInsertedHTML } from "next/navigation";
import { CacheProvider } from "@emotion/react";
import { useState } from "react";
import rtlPlugin from "stylis-plugin-rtl";

/**
 * Emotion style registry for Next.js App Router SSR — RTL variant.
 *
 * Why here: MUI uses Emotion under the hood. Without this registry, styles
 * generated on the server are not injected into the HTML <head>, causing a
 * flash of unstyled content on first load.
 *
 * RTL: stylis-plugin-rtl is applied as a Stylis plugin so that physical CSS
 * properties written in sx props and styled() calls (margin-left, padding-right,
 * etc.) are automatically flipped to their RTL equivalents at compile time.
 * MUI's own component styles are already RTL-aware via theme `direction: "rtl"`;
 * this plugin covers custom Emotion CSS.
 *
 * The cache key "muirtl" is the MUI convention for an RTL Emotion cache instance.
 *
 * What belongs here: Emotion cache setup and server HTML insertion only.
 * What does NOT belong here: theme logic (that lives in ThemeProvider).
 */
export default function EmotionRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ cache, flush }] = useState(() => {
    const cache = createCache({
      key: "muirtl",
      stylisPlugins: [rtlPlugin],
    });
    cache.compat = true;
    const prevInsert = cache.insert;
    let inserted: string[] = [];
    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };
    const flush = () => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };
    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) return null;
    let styles = "";
    for (const name of names) {
      styles += cache.inserted[name];
    }
    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
