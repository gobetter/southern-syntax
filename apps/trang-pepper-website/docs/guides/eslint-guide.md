# 📘 ESLint + Prettier Setup Guide (Flat Config for Next.js + TypeScript)

ระบบนี้ใช้ ESLint แบบ Flat Config (รองรับ ESLint v9+) ร่วมกับ Prettier และ TailwindCSS โดยรองรับ Next.js และ TypeScript อย่างสมบูรณ์ พร้อมตั้งค่ากฎแบบ Type-aware ได้

---

## ✅ ขั้นตอนการติดตั้ง

### 1. ติดตั้งแพ็กเกจที่จำเป็น

```bash
pnpm add -D \
  eslint \
  @eslint/js \
  @eslint/eslintrc \
  typescript \
  typescript-eslint \
  eslint-config-prettier \
  eslint-plugin-prettier \
  prettier \
  prettier-plugin-tailwindcss \
  eslint-config-next \
  @next/eslint-plugin-next # เพิ่มสำหรับ Next.js ESLint plugin ใน Flat Config
```

> 💡 หากเคยติดตั้ง `@eslint/eslintrc` แล้ว ให้รันอัปเดตด้วย:

```bash
pnpm update @eslint/eslintrc
```

---

## 📁 ไฟล์ที่ต้องสร้าง / แก้ไข

### 2. สร้างไฟล์ `.prettierrc`

```json
{
  "singleQuote": true,
  "semi": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### 3. สร้างไฟล์ `eslint.config.mjs`

```js
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import * as tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import nextPlugin from '@next/eslint-plugin-next'; // เพิ่ม import นี้

const compat = new FlatCompat({
  baseDirectory: import.meta.url ? new URL('.', import.meta.url).pathname : process.cwd(), // ปรับปรุง baseDirectory เพื่อความเข้ากันได้
});

const eslintConfig = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // แก้ไขตรงนี้: ใช้ config จาก nextPlugin โดยตรงในรูปแบบ Flat Config
  nextPlugin.configs.recommended,
  nextPlugin.configs['core-web-vitals'],

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: process.cwd(),
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      // ✏️ เปิดเฉพาะ rule ที่ต้องการ
      // '@typescript-eslint/await-thenable': 'warn',
      // '@typescript-eslint/no-floating-promises': 'error',
      'import/no-anonymous-default-export': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      // เพิ่มกฎของ Next.js ที่ต้องการ override หรือเปิด/ปิด
      '@next/next/no-img-element': 'warn', // ตัวอย่าง: เตือนเมื่อใช้ <img> แทน Next/Image
      '@next/next/no-html-link-for-pages': 'off', // ตัวอย่าง: ปิด rule นี้ถ้าใช้ App Router
    },
  },

  // ตั้งค่า Prettier ต้องอยู่ท้ายสุดเพื่อให้ override rules อื่นๆ ได้
  eslintConfigPrettier,
  eslintPluginPrettierRecommended,

  {
    ignores: [
      'node_modules/',
      '.next/',
      'dist/',
      'public/',
      '**/*.config.js',
      '**/*.config.mjs',
      '**/*.config.ts',
    ], // เพิ่ม .config.ts
  },
];

export default eslintConfig;
```

### 4. ปรับ `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "jsx": "preserve",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true,
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src", "next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### 5. เพิ่มใน `package.json`

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "pnpm exec eslint .",
  "lint:fix": "pnpm exec eslint . --fix",
  "format": "prettier --write ."
}
```

---

## 🔧 `lint:fix` คืออะไร? | What is `lint:fix`?

```json
"lint:fix": "pnpm exec eslint . --fix"
```

### 📌 ความหมาย (ภาษาไทย)

เป็นคำสั่งที่สั่งให้ ESLint ตรวจสอบและ **แก้ไขปัญหาที่สามารถแก้ไขได้โดยอัตโนมัติ** เช่น:

- การจัดรูปแบบโค้ด (spacing, indentation)
- การเรียงลำดับ import
- การลบตัวแปรที่ไม่ได้ใช้
- การเพิ่ม semicolon (\;) หรือเปลี่ยน single/double quote ตามกฎ Prettier

### 📌 Meaning (English)

This command tells ESLint to **automatically fix problems** that are auto-fixable, such as:

- Code formatting (spacing, indentation)
- Import sorting
- Removing unused variables
- Adding semicolons or adjusting quote styles as per Prettier rules

### ✅ วิธีใช้งาน | How to use

```bash
pnpm run lint:fix
```

ใช้เมื่อต้องการจัดระเบียบโค้ดก่อน commit, push หรือก่อน deploy ระบบ
(Recommended before committing, pushing, or deploying code)

---

## ✅ คำสั่งที่ใช้งาน

### รัน ESLint

```bash
pnpm lint
```

### รัน ESLint + Fix

```bash
pnpm lint:fix
```

### รัน Prettier

```bash
pnpm format
```

---

## ✨ ข้อดีของระบบนี้

- ✅ ใช้ ESLint Flat Config (v9+) แบบใหม่ล่าสุด
- ✅ รองรับ Next.js + TypeScript
- ✅ เปิดใช้งาน type-aware rules อย่างปลอดภัย
- ✅ รองรับ Prettier และ TailwindCSS
- ✅ พร้อมใช้งานร่วมกับ VS Code และ CI/CD
