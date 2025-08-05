# Setup Decisions for Trang Pepper CMS

เอกสารนี้รวบรวมเหตุผลและการตัดสินใจที่สำคัญระหว่างการตั้งค่าโปรเจกต์และการพัฒนาระบบในเฟสแรก ๆ เพื่อให้สามารถทบทวน และนำไปใช้ต่อยอดกับโปรเจกต์อื่นในอนาคต

## Base Stack และการตัดสินใจหลัก (Updated)

| หมวดหมู่          | รายละเอียด                             |
| ----------------- | -------------------------------------- |
| Framework         | Next.js 15.x (App Router)              |
| Language          | TypeScript (strict mode)               |
| Styling           | Tailwind CSS v4                        |
| Build Tool        | Vite (ESM only)                        |
| Module Type       | Native ES Modules (type: module)       |
| Package Manager   | pnpm                                   |
| Database Provider | Supabase (Free Tier, Cloud PostgreSQL) |

Export to Sheets

## การตัดสินใจเกี่ยวกับ Build Tool (Turbopack และ Vite)

- **Turbopack ถูกถอดออก:**

  - **เหตุผล:** พบปัญหาความเข้ากันได้กับ Tailwind v4 ในช่วงเริ่มต้น, ยังไม่เสถียรพอสำหรับการใช้งานใน Production (ในช่วงเวลาที่พิจารณา), และมี Warning รวมถึง Debug ยากหากใช้ร่วมกับ PostCSS + Testing
  - **การตัดสินใจ:** เปลี่ยนมาใช้ **Vite + Native ES Modules (**`type: module`**)** สำหรับการพัฒนา (Build Tool) แทน Turbopack โดยเน้นความเสถียรและความเข้ากันได้ของ Ecosystem

- **Vitest ถูกติดตั้ง (แต่ยังไม่ใช้งานเต็มรูปแบบใน Phase 1):**

  - **เหตุผล:** เพื่อเตรียมระบบ Unit Test / Component Test ไว้ล่วงหน้าตั้งแต่เริ่มต้น
  - **การตัดสินใจ:** แยกไปจัดเต็มใน Phase ถัดไป (Phase 2 สำหรับ Unit Testing ที่เกี่ยวข้องกับ Logic ของ Auth/AuthZ) โดยมีเอกสาร `docs/guides/testing-overview.md` พร้อมแล้ว ใน Phase 1 นี้ Vitest ยังไม่ถือเป็น Dependency หลักที่ต้องใช้งานอย่างเต็มรูปแบบ แต่ Config ถูกเตรียมไว้แล้ว

## การจัดการ Code Quality และ Formatting

- **ESLint + Prettier แบบ Flat Config:**

  - **เหตุผล:** ใช้โครงสร้างใหม่ของ ESLint (`eslint.config.mjs`) ที่รองรับ ESM เพื่อความทันสมัยและประสิทธิภาพ, ต้องการแยก Rules ชัดเจนสำหรับ TypeScript / Next / Prettier, และต้องการการจัด Format โค้ดอัตโนมัติ

  - **การตัดสินใจ:** ติดตั้ง ESLint และ Prettier, ใช้ `eslint-config-prettier` และ `eslint-plugin-prettier` ในรูปแบบ Flat Config

  - **การแก้ไขปัญหาที่พบเจอ:**

    - แก้ปัญหา `tslint is not defined` (Typo `tslint` เป็น `tseslint`).
    - แก้ปัญหา `nextPlugin is not defined` (โดยเพิ่ม `import nextPlugin from '@next/eslint-plugin-next';`).
    - แก้ปัญหา `extends` และ `plugins` key ใน Flat Config (ปรับโครงสร้าง `eslint.config.mjs` ให้ถูกต้อง).
    - แก้ปัญหา `@rushstack/eslint-patch` (โดยการลบแพ็กเกจและโค้ดที่เกี่ยวข้อง).
    - ตั้งค่า Editor (VS Code) เพื่อ `formatOnSave` และ `fixAll.eslint` เพื่อ Automate การจัดรูปแบบ

  - **คำสั่งที่ใช้:** `pnpm lint`, `pnpm lint:fix`, `pnpm format`

- **PostCSS / Tailwind 4:**

  - **เหตุผล:** ต้องการใช้ Tailwind CSS v4 ที่ทันสมัย และควบคุมการ Transpile CSS สำหรับ Browser เก่า
  - **การตัดสินใจ:** ใช้ `@tailwindcss/postcss` (ตามคำแนะนำ Tailwind v4), เพิ่ม `autoprefixer` เพื่อรองรับ Browser เก่า, กำหนด `browserslist` ใน `package.json`

## การตัดสินใจเกี่ยวกับฐานข้อมูล (PostgreSQL & Prisma)

- **ผู้ให้บริการฐานข้อมูล (Database Provider):**

  - **เหตุผล:** ต้องการ PostgreSQL Cloud Database ที่มี Free Tier เพียงพอสำหรับการพัฒนาและมี Scalability สำหรับอนาคต, มี File Storage ในตัว และเข้ากันได้ดีกับ NextAuth.js
  - **การตัดสินใจ:** เลือกใช้ **Supabase (Free Tier)** เป็น Database Provider หลัก แทนการรัน PostgreSQL ด้วย Docker ใน Local Environment

- **Prisma Client Output:**

  - **ปัญหาที่พบเจอ:** เมื่อกำหนด `output` ใน `generator client` ของ `schema.prisma` ไปยัง Path Custom (`../src/generated/prisma`) พบปัญหา `PrismaClient did not initialize yet` เมื่อรัน `pnpm dev`

  - **การตัดสินใจ:** นำ `output` ออกจาก `generator client` ใน `schema.prisma` เพื่อให้ Prisma Client ถูก Generate ไปยัง `node_modules/@prisma/client` ซึ่งเป็น Default Location ที่ Next.js/Webpack Resolver รู้จักและ Import Client ได้อย่างถูกต้อง

## การออกแบบ Schema สำหรับ User และ RBAC (เพื่อความยืดหยุ่นและรองรับหลายภาษา)

- **การเปลี่ยนชื่อ `emailVerified` เป็น `emailVerifiedAt`:**

  - **เหตุผล:** เพื่อให้มีความหมายที่ชัดเจนขึ้นว่าเก็บเวลาที่อีเมลถูกยืนยัน (DateTime) แทนที่จะเป็นแค่สถานะ Boolean, และสอดคล้องกับ Best Practice สำหรับ Timestamps
  - **การตัดสินใจ:** เปลี่ยนฟิลด์ `emailVerified` เป็น `emailVerifiedAt` ใน `User` Model

- **การเพิ่ม `isActive` และ `preferredLanguage` ใน User Model:**

  - **เหตุผล:** `isActive` (Boolean) เพื่อรองรับการระงับบัญชีผู้ใช้, `preferredLanguage` (String) เพื่อรองรับภาษา UI ที่ผู้ใช้แต่ละคนต้องการ
  - **การตัดสินใจ:** เพิ่มฟิลด์เหล่านี้ใน `User` Model เพื่อเตรียมพร้อมสำหรับการจัดการผู้ใช้ที่สมบูรณ์ขึ้น

- **การออกแบบ RBAC (`Role`, `Permission`, `RolePermission`) แบบ Dynamic:**

  - **เหตุผล:** ต้องการความยืดหยุ่นสูงสุดในการเพิ่ม/แก้ไข/ลบ Roles และ Permissions ผ่าน Admin UI โดยไม่ต้องแก้ไขโค้ดหรือรัน Migration ใหม่ และรองรับการแปลภาษาได้อย่างสมบูรณ์

  - **การตัดสินใจ:**

    - เพิ่มฟิลด์ `key` (String @unique) ใน `Role` และ `Permission` Models เพื่อเป็นตัวระบุทางเทคนิคที่ไม่เปลี่ยนแปลงสำหรับการ Lookup ในโค้ด

    - ใช้ `String` type สำหรับ `Role.name`, `Permission.action`, และ `Permission.resource` (แทน `enum` ใน `schema.prisma`) เพื่อให้สามารถจัดการค่าเหล่านี้ได้แบบ Dynamic ผ่าน Admin UI

    - เพิ่มฟิลด์ `isSystem` (Boolean @default(false)) ใน `Role` และ `Permission` Models เพื่อทำเครื่องหมายบทบาท/สิทธิ์หลักของระบบที่ควรได้รับการป้องกันจากการลบ/แก้ไขผ่าน UI ทั่วไป

    - เพิ่ม `@@index([name])` และ `@@index([key])` ใน `Role` Model, และ `@@index([action])`, `@@index([resource])`, `@@index([key])` ใน `Permission` Model เพื่อปรับปรุงประสิทธิภาพการค้นหา

- **การตัดสินใจไม่รองรับ Multi-role ในตอนนี้:**

  - **เหตุผล:** การ Implement Multi-role (ผู้ใช้มีหลายบทบาท) เพิ่มความซับซ้อนอย่างมากใน Logic การจัดการสิทธิ์และโครงสร้างฐานข้อมูล และยังไม่เป็น Requirement ที่ชัดเจนใน Phase แรก ๆ
  - **การตัดสินใจ:** ยึดถือแนวทาง "User มี 1 Role" ในตอนนี้ และจดบันทึกไว้เป็นการขยายระบบในอนาคต

## การจัดโครงสร้างโค้ดสำหรับ Auth/AuthZ (Modularization)

- **โครงสร้างโฟลเดอร์`src/lib/auth/`:**

  - **เหตุผล:** เพื่อจัดหมวดหมู่ไฟล์ที่เกี่ยวข้องกับ Authentication และ Authorization ให้เป็นระเบียบ, แยกส่วนรับผิดชอบ (Separation of Concerns), และทำให้โค้ดเป็น Modular และนำกลับมาใช้ซ้ำได้

  - **การตัดสินใจ:** สร้างโฟลเดอร์ `src/lib/auth/` และย้ายไฟล์ที่เกี่ยวข้องทั้งหมดเข้าไป (เช่น `options.ts`, `schemas.ts`, `service.ts`, `utils.ts`)

  - **การรวมไฟล์:** รวมเนื้อหาของ `auth-utils.ts` (Password Hashing) และ `authz-utils.ts` (Permission Checker) เข้าไปในไฟล์เดียวชื่อ `src/lib/auth/utils.ts`

  - **Re-exporting (index.ts):** เปลี่ยนชื่อไฟล์หลัก `src/lib/auth/auth.ts` เป็น `src/lib/auth/index.ts` และใช้ `export * from './...'` เพื่อให้ไฟล์ภายนอกสามารถ Import ทุกอย่างจาก `auth/` โดยตรงได้ (`import { ... } from '@/lib/auth';`)

- **การใช้ Zod สำหรับ Type Safety และ Validation:**

  - **เหตุผล:** เพื่อให้ได้ Type Safety ที่ Compile-time (ผ่าน `z.infer`) และที่สำคัญคือ Runtime Validation สำหรับข้อมูล Input ที่รับมาจาก Frontend (เช่น Credentials, Role/Permission data)

  - **การตัดสินใจ:** ใช้ Zod (`credentialsSchema`, `roleSchema`, `permissionSchema`) ใน `src/lib/auth/schemas.ts`

  - **การใช้ **`const`** objects:** สร้าง `const` objects สำหรับ `ROLE_NAMES`, `PERMISSION_ACTIONS`, `PERMISSION_RESOURCES` ใน `src/lib/auth/constants.ts` และใช้ `as const` เพื่อสร้าง Literal Type และใช้ `typeof SOME_CONST_OBJECT[keyof typeof SOME_CONST_OBJECT]` เพื่อ Infer Type

  - **การแก้ไขปัญหาที่พบเจอ:** แก้ไข Type Error ที่เกิดจากการพยายามใช้ Dot Notation กับ `readonly` arrays โดยการเปลี่ยน `const` array เป็น `const` object

## สิ่งที่ต้องพิจารณาเพิ่มเติมในอนาคต (Future Enhancements & Considerations)

- **ระบบ Audit Log:**

  - **วัตถุประสงค์:** การสร้างตาราง `AuditLog` เพื่อบันทึกกิจกรรมสำคัญของผู้ใช้งาน (เช่น การสร้าง/แก้ไข/ลบผู้ใช้, บทบาท, สิทธิ์, เนื้อหา) เพื่อประโยชน์ในการตรวจสอบ (Audit Trail), การแก้ไขปัญหา, และความปลอดภัย
  - **สถานะปัจจุบัน:** ออกแบบ Model ไว้แล้วในความคิด แต่ยังไม่ได้ Implement ใน `prisma/schema.prisma` หรือ Application Logic
  - **แผน:** จะพิจารณานำไป Implement ใน Phase 3: โครงสร้างพื้นฐานเนื้อหา (Content Infrastructure) หรือเป็น Phase แยกสำหรับ "Core Services Enhancement" ในอนาคต (เช่น Phase 5 หรือ 3.4)

## สรุปแนวคิด

ทำให้ Foundation (Phase 1) เรียบง่าย เสถียร และ Reusable แล้วจึงค่อยขยายไปยัง Testing, Auth, CMS logic ใน Phase ถัดไป

## ผู้จัดทำ

- Isara Chumsri (2024–2025)
- Codex + ChatGPT (ระบบผู้ช่วยร่วมพัฒนา)
