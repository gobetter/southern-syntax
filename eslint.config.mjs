// eslint.config.mjs (root)
import base from "@southern-syntax/eslint-config-custom/base";

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
];
