import { nextJsConfig } from "@southern-syntax/eslint-config-custom/next-js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nextJsConfig,
  // ⛔ อย่าให้ ESLint พยายามทำ type-aware กับไฟล์ config ต่าง ๆ
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "dist/**",
      "messages/**",
      "scripts/**",
      "coverage/**",
      // ระบุไฟล์ config ที่ฟ้อง
      "eslint.config.*",
      "postcss.config.*",
      "vitest.config.*",
      "next.config.*",
      "tailwind.config.*",
    ],
  },
];
