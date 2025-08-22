import base from "@southern-syntax/eslint-config-custom/base";
import unicorn from "eslint-plugin-unicorn";

export default [
  // 1) ignore ให้ครอบคลุม
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/.turbo/**",
      "**/*.d.ts",
      "**/*.config.*",
      "**/eslint.config.*",
      "**/.eslintrc.*",
      "**/scripts/**",
      "apps/trang-pepper-website/.eslintrc.*",
      "packages/eslint-config-custom/react-internal.js",
      // 'packages/eslint-config-custom/**', // ถ้าจะเมินทั้งแพ็กเกจ config
    ],
  },

  // 2) (เอา parser ออก) ไม่ต้องกำหนด parser สำหรับ JS/CJS/MJS
  // ถ้าจะคง override นี้ไว้ก็ได้ แต่ห้ามใส่ parser
  {
    files: ["**/*.{js,cjs,mjs}"],
    languageOptions: {
      // ไม่ต้องตั้ง parser — ESLint จะใช้ Espree ให้อัตโนมัติ
      // จะเพิ่ม globals ได้ถ้าจำเป็น เช่น:
      // globals: (await import('globals')).default.node,
    },
  },

  // 3) ตามด้วย base config ของคุณ
  ...base,

  // 4) ✨ เพิ่มกฎ kebab-case ให้ทุกแพ็กเกจ (เฉพาะ TS/TSX)
  {
    files: ["packages/**/*.ts", "packages/**/*.tsx"],
    plugins: { unicorn },
    rules: {
      "unicorn/filename-case": ["error", { case: "kebabCase" }],
    },
  },

  // 5) ✨ เพิ่มกฎ kebab-case ให้แอป (Next.js)
  {
    files: ["apps/**/*.{ts,tsx,js,jsx}"],
    plugins: { unicorn },
    rules: {
      "unicorn/filename-case": ["error", { case: "kebabCase" }],
    },
  },

  // 6) ❗️ผ่อนปรนให้ config-only packages (ไม่ตรวจกฎนี้)
  {
    files: [
      "packages/tsconfig/**/*.{js,mjs,cjs,json}",
      "packages/eslint-config-custom/**/*.{js,mjs,cjs,json}",
    ],
    rules: {
      "unicorn/filename-case": "off",
    },
  },
];
