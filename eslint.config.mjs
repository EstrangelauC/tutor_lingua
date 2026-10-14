// @ts-check
import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier/flat";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
  globalIgnores([
    "**/node_modules/",
    "**/dist/",
    "**/.turbo/",
    "**/.test-dist/",
    "**/.expo/",
    "**/web-build/",
    "apps/mobile/expo-env.d.ts",
    "apps/mobile/ios/",
    "apps/mobile/android/",
  ]),
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ["apps/api/**/*.ts", "packages/shared/**/*.ts", "**/*.{js,cjs,mjs}"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["apps/mobile/**/*.{ts,tsx}"],
    extends: [reactHooks.configs.flat.recommended],
  },
  prettier,
);
