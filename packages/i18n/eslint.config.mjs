// packages/i18n/eslint.config.mjs
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // 1) ignore อะไรบ้าง
  { ignores: ["dist/**", "messages/**", "node_modules/**"] },

  // 2) base rules
  js.configs.recommended,

  // 3) TS rules แบบ non type-checked (ไม่ต้องตั้ง project)
  ...tseslint.configs.recommended,

  // 4) (ออปชัน) ระบุไฟล์ที่เราจะลินต์ให้ชัด
  {
    files: ["**/*.{ts,tsx}"],
    // ใส่กฎเพิ่มได้ตรงนี้
    rules: {},
  }
);
