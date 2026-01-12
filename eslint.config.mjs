import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Ignore example and documentation folders (same as tsconfig.json)
    "example/**/*",
    "example-websites/**/*",
    "docs/example/**/*",
    "ONLY AS AN EXAMPLE/**/*",
    "ONLY AS EXAMPLE 2/**/*",
  ]),
  {
    files: ["tailwind.config.js", "postcss.config.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);

export default eslintConfig;
