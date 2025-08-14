import { config as base } from "@southern-syntax/eslint-config-custom/base";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...base,
  {
    // อย่าให้ ESLint ไปจับไฟล์ config & โฟลเดอร์ที่ไม่ต้องการ
    ignores: [
      "eslint.config.*",
      "postcss.config.*",
      "vitest.config.*",
      "next.config.*",
      "tailwind.config.*",
      "node_modules/**",
      "dist/**",
      "prisma/**", // ถ้าอยากลินต์ภายหลัง ค่อยลบออก
    ],
  },
];
