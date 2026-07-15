import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    server: {
      // jsdom's CSS parsing deps ship a mixed CJS/ESM package graph that
      // Node's bare `require()` can't load in this CJS package; routing
      // them through Vite's transform instead avoids ERR_REQUIRE_ESM.
      deps: {
        inline: [/jsdom/, /@asamuzakjp/, /css-color/, /css-calc/, /@mui/, /react-transition-group/],
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
