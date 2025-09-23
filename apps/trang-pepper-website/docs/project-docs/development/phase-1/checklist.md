# Phase 1: การวางรากฐาน (Foundation Setup) - Checklist

ต่อไปนี้คือรายการสิ่งที่คุณได้ดำเนินการไปแล้ว และสิ่งที่ต้องทำต่อไปใน Phase นี้ครับ

## 1. การตั้งค่าโครงการ Next.js ขั้นต้นและ Developer Experience

- **1.1. การสร้างโปรเจกต์ Next.js (Next.js Project Creation)**

  - [x] **สถานะ: สำเร็จ:** โปรเจกต์ `trang-pepper-cms` ถูกสร้างขึ้นเรียบร้อยแล้วด้วย Next.js 15.3.3, App Router, TypeScript, ESLint, Tailwind CSS และ Webpack สำหรับ `next dev`.
  - [x] **คำสั่งที่ใช้:** `pnpm create next-app@latest trang-pepper-cms --typescript --app --eslint --tailwind --src --no-turbopack --no-custom-alias`
  - [x] **หมายเหตุ:** โปรดเลือก `Yes` สำหรับ `src/` directory และ `No` สำหรับการ customize import alias เมื่อ `create-next-app` ถามเพื่อยืนยัน.

- **1.2. การกำหนดค่า TypeScript (TypeScript Configuration)**

  - [x] **สถานะ: สำเร็จ:** ไฟล์ `tsconfig.json` ถูกตั้งค่าเริ่มต้นโดย Next.js และมีการยืนยันว่า `strict: true` ถูกตั้งค่าไว้อย่างถูกต้อง.

- **1.3. การกำหนดค่า ESLint และ Prettier (ESLint & Prettier Configuration)**

  - [x] **สถานะ: สำเร็จ:** ESLint และ Prettier ถูกตั้งค่าใน `eslint.config.mjs` และ `.prettierrc` เพื่อให้ทำงานร่วมกันได้อย่างสมบูรณ์.
  - [x] **สิ่งที่แก้ไข:**
    - ปัญหา `tslint is not defined` (แก้ไข Typo `tslint` เป็น `tseslint`).
    - ปัญหา `nextPlugin is not defined` (แก้ไขโดยเพิ่ม `import nextPlugin from '@next/eslint-plugin-next';`).
    - ปัญหา `extends` และ `plugins` key ใน Flat Config (แก้ไขโครงสร้าง `eslint.config.mjs` ให้ถูกต้อง).
    - ปัญหา `@rushstack/eslint-patch` (แก้ไขโดยการลบแพ็กเกจและโค้ดที่เกี่ยวข้อง).
  - [x] **คำสั่งติดตั้ง:** `pnpm add -D prettier eslint-config-prettier eslint-plugin-prettier prettier-plugin-tailwindcss` (หากใช้ Tailwind).
  - [x] **การตั้งค่า Editor (VS Code):** ตั้งค่า `formatOnSave` และ `fixAll.eslint` เพื่อให้ Editor จัดรูปแบบและแก้ไขข้อผิดพลาด ESLint อัตโนมัติเมื่อบันทึก.
  - [x] **ยืนยัน:** `pnpm run lint` และ `pnpm format` ทำงานได้โดยไม่มีข้อผิดพลาด.

- **1.4. การจัดการ Dependencies (เพิ่มเติม)**

  - [x] **สถานะ: สำเร็จ:** Dependencies พื้นฐานที่จำเป็นถูกติดตั้งแล้ว.
  - [x] **ติดตั้ง Shadcn UI:** `pnpm dlx shadcn@latest init` (อัปเดตคำสั่ง) และเพิ่ม Component ตัวอย่าง (เช่น `button`, `input`).
  - [x] **ติดตั้ง Zod:** `pnpm add zod`.
  - [x] **ติดตั้ง bcryptjs:** `pnpm add bcryptjs @types/bcryptjs -D`.

- **1.5. การตั้งค่าโครงสร้างโฟลเดอร์เริ่มต้น (Modularization)**

  - [x] **สถานะ: สำเร็จ:** โปรเจกต์ใช้ `src/` directory.
  - [x] **โครงสร้าง `src/lib/auth/` (Modularization):**
    - สร้างโฟลเดอร์ `src/lib/auth/` และย้ายไฟล์ที่เกี่ยวข้องกับ Authentication และ Authorization เข้าไป (เช่น `options.ts`, `schemas.ts`, `service.ts`, `utils.ts`).
    - [x] รวมเนื้อหาของ `auth-utils.ts` และ `authz-utils.ts` เข้าไปในไฟล์เดียวชื่อ `src/lib/auth/utils.ts`.
    - [x] เปลี่ยนชื่อไฟล์หลัก `src/lib/auth/auth.ts` เป็น `src/lib/auth/index.ts` เพื่อให้ Import Path ดูสะอาดตา (`import { ... } from '@/lib/auth';`).
    - [x] ปรับปรุง `import` paths ทั้งหมดที่เกี่ยวข้องให้ถูกต้องตามโครงสร้างใหม่.
  - [x] **Type Augmentation:** สร้างไฟล์ `src/types/next-auth.d.ts` เพื่อขยาย Type ของ Session และ JWT สำหรับ NextAuth.js (รองรับ `string | null | undefined` สำหรับ `email`/`name` และเพิ่ม `id`).
  - [x] **สร้าง `@southern-syntax/rbac`:** กำหนด `const` objects สำหรับ `ROLE_NAMES`, `PERMISSION_ACTIONS`, `PERMISSION_RESOURCES` และ Type aliases เพื่อ Type Safety และ Runtime Validation (ด้วย Zod).

- **1.6. การทดสอบการตั้งค่าเบื้องต้น (Initial Setup Testing)**
  - [x] **สถานะ: สำเร็จ:**
    - [x] รัน Development Server (`pnpm dev`) และยืนยันว่าทำงานปกติ.
    - [x] ทดสอบ Hot Module Replacement (HMR).
    - [x] ทดสอบการจัดรูปแบบโค้ดอัตโนมัติด้วย Prettier/ESLint.
    - [x] ยืนยันว่า Vitest ถูกตั้งค่าถูกต้อง, มีไฟล์ทดสอบตัวอย่าง และ `pnpm exec vitest run` ผ่าน.

## 2. การกำหนดค่าฐานข้อมูล (Supabase PostgreSQL) และ ORM (Prisma)

- **2.1. การเตรียม Supabase Project (Free Tier)**

  - [x] **สถานะ: สำเร็จ:** ลงทะเบียนและสร้าง Project ใน Supabase (Free Tier) และคัดลอก Connection String.
  - **การตัดสินใจ:** เลือก Supabase เป็น Database Provider หลัก แทน Docker สำหรับ Local Development เพื่อความยืดหยุ่น, Scalability, และ File Storage ในตัว.

- **2.2. การติดตั้ง Prisma CLI และ Prisma Client**

  - [x] **สถานะ: สำเร็จ:** ติดตั้ง Prisma CLI: `pnpm add -D prisma` และ Prisma Client: `pnpm add @prisma/client`.

- **2.3. การ Initializing Prisma ในโปรเจกต์**

  - [x] **สถานะ: สำเร็จ:** รันคำสั่ง `pnpm prisma init` เพื่อสร้าง `prisma/` folder และ `schema.prisma`.
  - [x] ตรวจสอบว่าไฟล์ `.env` ถูกสร้าง/อัปเดต.

- **2.4. การกำหนดค่า `.env` สำหรับ Database Connection**

  - [x] **สถานะ: สำเร็จ:** เปิดไฟล์ `.env` และตั้งค่า `DATABASE_URL` ด้วย Connection String จาก Supabase.
  - [x] **การสร้าง Secret Key:** ใช้ `openssl rand -base64 32` เป็นวิธีที่แนะนำในการ Generate `NEXTAUTH_SECRET` (แทน `pnpm dlx @auth/core@latest secret` หรือ `pnpm dlx auth@latest secret` ที่เคยลอง).

- **2.5. การกำหนด Schema ใน `prisma/schema.prisma` (สำหรับ User Model และ RBAC)**

  - [x] **สถานะ: สำเร็จ:** เปิดไฟล์ `prisma/schema.prisma` และกำหนด `datasource`/`generator`.
  - [x] **การแก้ไข `generator client` output:** นำ `output` ออกจาก `generator client` ใน `schema.prisma` เพื่อให้ Prisma Client ถูก Generate ไปยัง `node_modules/@prisma/client` (Default Location) แก้ปัญหา `PrismaClient did not initialize`.
  - [x] **`User` Model:**
    - เปลี่ยนชื่อฟิลด์ `emailVerified` เป็น `emailVerifiedAt` (DateTime?).
    - เพิ่มฟิลด์ `isActive` (Boolean, `@default(true)`) และ `preferredLanguage` (String?).
  - [x] **RBAC Models (`Role`, `Permission`, `RolePermission`):**

    - เพิ่มฟิลด์ `key` (String `@unique`) ใน `Role` และ `Permission` Models.
    - ใช้ `String` type สำหรับ `Role.name`, `Permission.action`, `Permission.resource` (แทน `enum`) เพื่อให้จัดการค่าเหล่านี้แบบ **Dynamic** ผ่าน Admin UI ได้.
    - เพิ่มฟิลด์ `isSystem` (Boolean, `@default(false)`).
    - เพิ่ม `@@index([name])` และ `@@index([key])` ใน `Role` Model, และ `@@index([action])`, `@@index([resource])`, `@@index([key])` ใน `Permission` Model เพื่อปรับปรุงประสิทธิภาพการค้นหา.

  - [x] **NextAuth.js Models:** `Account`, `Session`, `VerificationToken` มีการใช้ `@db.Text` สำหรับ Token fields และ `@@index([userId])` เพื่อประสิทธิภาพ.
  - [x] **การตัดสินใจ:** ไม่รองรับ Multi-role ในตอนนี้ (ยึดแนวทาง "User มี 1 Role") และจดบันทึกไว้เป็นการขยายระบบในอนาคต.

- **2.6. การสร้าง Prisma Client Instance**
  - [x] **สถานะ: สำเร็จ:** สร้างไฟล์ `src/lib/prisma.ts` เพื่อจัดการ Global Prisma Client Instance (ใช้ `import { PrismaClient } from '@prisma/client';`).

## 3. การดำเนินการ Database Migration

- **3.1. การรัน Migration ครั้งแรก**

  - [x] **สถานะ: สำเร็จ:** ตรวจสอบสถานะ Database Connection และรันคำสั่ง `pnpm prisma migrate dev --name init-auth`.
  - [x] **Migration เพิ่มเติม:** รัน Migration อื่นๆ ที่ตามมาเพื่อปรับใช้การเปลี่ยนแปลง Schema ทั้งหมดกับฐานข้อมูล Supabase (เช่น `add-rbac-keys`, `add-is-system-flag-to-rbac`, `add-user-status-and-language`)

- **3.2. การ Generate Prisma Client (หากไม่ได้เกิดขึ้นอัตโนมัติ)**

  - สถานะ: [x] **สำเร็จ:** ยืนยันว่า Prisma Client ถูก Generate โดยอัตโนมัติ หรือรัน `pnpm prisma generate` ด้วยตนเอง.

- **3.3. การตรวจสอบ Migration ใน Supabase**
  - [x] **สถานะ: สำเร็จ:** เข้าสู่ Supabase Dashboard -> Table Editor และยืนยันว่าตารางทั้งหมด (User, Account, Session, VerificationToken, Role, Permission, RolePermission, และ `_prisma_migrations`) ถูกสร้างขึ้นอย่างถูกต้อง.
  - **หมายเหตุ:** พบปัญหาในการใช้ Prisma Studio ในบางครั้ง (เช่น ไม่แสดง Dropdown, การ Sync ข้อมูล) จึงเลือกแก้ไข/เพิ่มข้อมูลโดยตรงใน Supabase Dashboard เพื่อความสะดวกในการ Seeding Data สำหรับทดสอบ RBAC.

## 4. การทดสอบการตั้งค่าเบื้องต้น (Initial Setup Testing) และ RBAC

- สถานะ: [x] **สำเร็จ:**
  - [x] รัน Development Server (`pnpm dev`) และยืนยันว่าทำงานปกติ.
  - [x] ทดสอบ Hot Module Replacement (HMR).
  - [x] ทดสอบ ESLint และ Prettier (`formatOnSave`, `fixAll.eslint`, `pnpm run lint`, `pnpm format`).
  - [x] ทดสอบ Vitest (ยืนยันว่าถูกตั้งค่าถูกต้องและรันผ่าน).
  - [x] **ทดสอบการป้องกัน Route (Unauthenticated & Unauthorized Access):**
    - [x] ตรวจสอบว่าผู้ใช้ที่ไม่ได้ Login ถูก Redirect ไปหน้า Login.
    - [x] จัดเตรียมข้อมูลเริ่มต้น (Role, Permission, User) ใน Supabase Dashboard (แทน Prisma Studio).
    - [x] ตรวจสอบว่าผู้ใช้ที่ Login แล้ว แต่ไม่มีสิทธิ์ถูก Redirect (ทดสอบด้วย `basic@example.com`).
    - [x] ตรวจสอบว่าผู้ใช้ที่ Login แล้ว และมีสิทธิ์สามารถเข้าถึงหน้า Admin ได้ (ทดสอบด้วย `admin@example.com`).
    - [x] แก้ไขปัญหา Type Error ใน `can` function โดยการปรับ `constants.ts` ให้เป็น `const` objects.

---

รากฐานที่แข็งแกร่งนี้พร้อมแล้วสำหรับการพัฒนาคุณสมบัติหลักของ CMS ใน Phase ถัดไป.

---

## ➡️ ขั้นตอนต่อไป

เราพร้อมที่จะก้าวเข้าสู่ **Phase 2: การจัดการผู้ใช้และการเข้าถึงหลัก (Core User & Access Management)** ซึ่งจะเน้นไปที่การผสานรวม NextAuth.js และการพัฒนาระบบ RBAC.
