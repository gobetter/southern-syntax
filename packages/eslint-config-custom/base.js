import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";
// เพียงแค่ import ก็เพียงพอ: plugin นี้จะ downgrade errors → warnings ทั้งหมด
import "eslint-plugin-only-warn";

/**
 * Shared base config for the monorepo (flat config, ESLint v9+)
 * @type {import("eslint").Linter.Config[]}
 */
const base = [
  // JS recommended + Prettier (ปิด rule ที่ขัดกับ format)
  js.configs.recommended,
  eslintConfigPrettier,

  // TypeScript (แบบ non-type-checked ให้เร็ว)
  // ถ้าอยากเปิดแบบ type-aware: ใช้ tseslint.configs.recommendedTypeChecked
  // แล้วเพิ่ม languageOptions.parserOptions.projectService = true (ดูด้านล่าง)
  ...tseslint.configs.recommended,

  // ตั้ง parser/ตัวเลือกกลางสำหรับไฟล์ TS/TSX ทั้งเรโป
  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        // auto-discovery tsconfig ในแพ็กเกจ (TS v5 + typescript-eslint v8)
        projectService: true,
        tsconfigRootDir: import.meta.dirname, // ให้ค้นหา tsconfig ใกล้ไฟล์นี้เป็นฐาน
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  },

  // Turbo rules
  {
    plugins: { turbo: turboPlugin },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
    },
  },

  // Monorepo ignores
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/.turbo/**",
      "**/coverage/**",
      "**/build/**",
    ],
  },
];

export default base;
// เผื่อบางโปรเจกต์ยัง import แบบเดิม
export const config = base;
