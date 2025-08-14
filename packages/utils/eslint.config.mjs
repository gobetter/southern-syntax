import { config as base } from "@southern-syntax/eslint-config-custom/base";
import tseslint from "typescript-eslint";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import("eslint").Linter.Config[]} */
export default [
  // ฐานกลางของ repo (non type-aware)
  ...base,

  // ✅ non type-aware ทั่วไป (ครอบทั้ง src และ tests)
  ...tseslint.configs.recommended,

  // ✅ เปิด type-aware เฉพาะโค้ดจริงใน src เท่านั้น
  ...tseslint.configs.recommendedTypeChecked.map((c) => ({
    ...c,
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      ...(c.languageOptions ?? {}),
      parser: tseslint.parser,
      parserOptions: {
        ...(c.languageOptions?.parserOptions ?? {}),
        // ใช้ tsconfig.json หลักของ package เพื่อ resolve โค้ดใน src/
        tsconfigRootDir: __dirname,
        project: ["./tsconfig.json"],
        projectService: true,
        allowDefaultProject: true,
      },
    },
  })),

  // 🚫 ปิด type-aware สำหรับไฟล์ test ทั้งหมด (ให้เป็น non type-aware ธรรมดา)
  {
    files: ["__tests__/**/*.{ts,tsx}", "**/*.{test,tests,spec}.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: false, // 👈 สำคัญ: ไม่ผูกกับ TS project ใด ๆ
      },
    },
    // อยากผ่อนกฎบางอย่างใน test ก็ทำตรงนี้ได้
    rules: {
      // ตัวอย่าง:
      // "@typescript-eslint/no-explicit-any": "off",
    },
  },

  // ไม่ต้อง lint ไฟล์ config/build outputs
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "eslint.config.*",
      "vitest.config.*",
      "postcss.config.*",
      "tailwind.config.*",
    ],
  },
];
