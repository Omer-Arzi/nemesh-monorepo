import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier";

/**
 * ESLint configuration.
 *
 * Layer order (each layer overrides the previous):
 *  1. next/core-web-vitals  — Next.js + React rules
 *  2. next/typescript        — TypeScript-aware rules
 *  3. eslint-config-prettier — disables formatting rules that conflict with Prettier
 *
 * Add project-specific rule overrides in the last object.
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettierConfig,

  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  // Project-specific overrides
  {
    rules: {
      // Prefer named exports for components (makes refactoring and auto-import easier).
      // TODO: enforce once the team is aligned on the convention.
      // "import/prefer-default-export": "off",
    },
  },
]);

export default eslintConfig;
