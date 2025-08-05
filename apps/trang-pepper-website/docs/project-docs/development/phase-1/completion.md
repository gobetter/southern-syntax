# ✅ สรุปการเสร็จสิ้น Phase 1: การวางรากฐาน (Foundation Setup)

เอกสารนี้บันทึกขั้นตอนและผลลัพธ์ที่ได้จากการดำเนินการ **Phase 1: การวางรากฐาน (Foundation Setup)** ของโปรเจกต์ `trang-pepper-cms` ซึ่งเป็นการสร้างรากฐานที่มั่นคงสำหรับ Web Application แบบ Multilingual CMS

---

## 🚀 ภาพรวมของ Phase 1

ใน Phase นี้ เราได้มุ่งเน้นไปที่การตั้งค่าสภาพแวดล้อมการพัฒนา, เครื่องมือ, และฐานข้อมูลหลัก เพื่อให้โปรเจกต์พร้อมสำหรับการพัฒนาคุณสมบัติหลักใน Phase ถัดไป

### 🎯 เป้าหมายที่ทำสำเร็จ

- ตั้งค่า Next.js Project พร้อม App Router และ TypeScript (Strict Mode)
- กำหนดค่า ESLint และ Prettier สำหรับ Code Quality และ Formatting
- ติดตั้งและกำหนดค่า Shadcn UI สำหรับ UI Components ที่ปรับแต่งได้
- ติดตั้งและตั้งค่า Vitest สำหรับ Unit/Component Testing
- กำหนดค่าฐานข้อมูล PostgreSQL ด้วย Supabase (Free Tier) และ Prisma ORM
- ดำเนินการ Database Migration ครั้งแรก เพื่อสร้างตารางฐานข้อมูลเบื้องต้น
- เตรียมโครงสร้าง Schema สำหรับระบบยืนยันตัวตนและจัดการสิทธิ์ (RBAC) ที่ยืดหยุ่น

---

## ✨ สิ่งที่ทำสำเร็จในแต่ละส่วน

### 1. การตั้งค่าโครงการ Next.js ขั้นต้นและ Developer Experience

- **สร้างโปรเจกต์ Next.js:**

  - ใช้ `pnpm create next-app@latest trang-pepper-cms --typescript --eslint --tailwind --src --app --no-turbopack --no-custom-alias` เพื่อเริ่มต้นโปรเจกต์
  - เลือกใช้ Tailwind CSS, `src/` directory, App Router และไม่ใช้ Turbopack สำหรับ next dev (ใช้ Webpack เป็น Default)
  - ใช้ Import Alias แบบ Default (`@/*`)
  - **หมายเหตุ:** แม้จะใช้คำสั่งด้านบนนี้ `create-next-app` อาจจะยังคงถามคำถามบางอย่างเพื่อยืนยัน (เช่น `Would you like your code inside a 'src/' directory?` และ `Would you like to customize the import alias (@/* by default)?`) โปรดเลือก `Yes` สำหรับ `src/` directory และ `No` สำหรับการ customize import alias ตามการตั้งค่าที่ได้ตกลงกันไว้

- **การกำหนดค่า TypeScript:**
  - ยืนยัน `strict: true` ใน `tsconfig.json`.
- **การกำหนดค่า ESLint และ Prettier:**

  - อัปเดต `eslint.config.mjs` เพื่อผสานรวม `eslint-config-prettier` และ `eslint-plugin-prettier` ในรูปแบบ Flat Config.
  - แก้ไขปัญหาสำคัญหลายประการที่พบเจอระหว่างการตั้งค่า:
    - `tslint is not defined` (แก้ไข Typo `tslint` เป็น `tseslint`)
    - `nextPlugin is not defined` (แก้ไขโดยเพิ่ม `import nextPlugin from '@next/eslint-plugin-next';`)
    - แก้ไขปัญหา `extends` และ `plugins` key ใน Flat Config (แก้ไขโครงสร้าง `eslint.config.mjs` ให้ถูกต้อง)
    - แก้ไขปัญหา `@rushstack/eslint-patch` (แก้ไขโดยการลบแพ็กเกจและโค้ดที่เกี่ยวข้อง).
  - ตั้งค่า Editor (VS Code) เพื่อ `formatOnSave` และ `fixAll.eslint`.
  - ยืนยันว่า `pnpm run lint` และ `pnpm format` ทำงานได้โดยไม่มีข้อผิดพลาด.

- **การจัดการ Dependencies:**

  - ติดตั้ง `shadcn/ui` ด้วย `pnpm dlx shadcn@latest init` (อัปเดตคำสั่งจาก shadcn-ui).
  - ดำเนินการ Initializing `shadcn/ui` โดย CLI ตรวจพบการตั้งค่าที่มีอยู่และถามคำถามเฉพาะที่จำเป็น.
  - เพิ่ม Component ตัวอย่าง (button) และยืนยันว่า Shadcn UI ทำงานได้ดีและไม่มีปัญหาโครงสร้าง.
  - ติดตั้ง `zod` สำหรับ Schema Validation และ Type Inferencing.
  - ติดตั้ง `bcryptjs` สำหรับ Password Hashing.

- **การตั้งค่าโครงสร้างโฟลเดอร์ src/lib/auth/ (Modularization):**

  - ปรับโครงสร้างโฟลเดอร์ `src/lib/` โดยสร้างโฟลเดอร์ auth/ แยกต่างหาก
  - ย้ายไฟล์ที่เกี่ยวข้องกับ Authentication และ Authorization เข้าไปใน `src/lib/auth/` (เช่น `options.ts`, `schemas.ts`, `service.ts`, `utils.ts`)
  - รวมเนื้อหาของ `auth-utils.ts` (Password Hashing) และ `authz-utils.ts` (Permission Checker) เข้าไปในไฟล์เดียวชื่อ `src/lib/auth/utils.ts`
  - เปลี่ยนชื่อไฟล์หลัก `src/lib/auth/auth.ts` เป็น `src/lib/auth/index.ts` เพื่อให้ Import Path ดูสะอาดตาขึ้น (`import { ... } from '@/lib/auth';`)
  - ปรับปรุง `import`j paths ทั้งหมดที่เกี่ยวข้องให้ถูกต้องตามโครงสร้างใหม่

- **การทดสอบเบื้องต้น:**
  - รัน `pnpm dev` และยืนยันว่า Development Server ทำงานปกติ.
  - ทดสอบ Hot Module Replacement (HMR).
  - ยืนยันว่า Vitest ถูกตั้งค่าถูกต้อง, มีไฟล์ทดสอบตัวอย่าง และ `pnpm exec vitest run` ผ่าน.

### 2. การกำหนดค่าฐานข้อมูล (Supabase PostgreSQL) และ ORM (Prisma)

- **การเตรียม Supabase Project:**

  - สร้างโปรเจกต์ Supabase (Free Tier) และคัดลอก Connection String.
  - **หมายเหตุ:** ตัดสินใจเลือก Supabase เป็น Database Provider หลัก แทน Docker สำหรับ Local Development เพื่อความยืดหยุ่น, Scalability, และ File Storage ในตัว.

- **การติดตั้ง Prisma:**

  - ติดตั้ง `prisma` (CLI) และ `@prisma/client`.
  - รัน `pnpm prisma init` เพื่อสร้าง `prisma/` folder และ `schema.prisma`.

- **การกำหนดค่า **`.env`**:**

  - ตั้งค่า `DATABASE_URL` ในไฟล์ `.env` ด้วย Connection String จาก Supabase.
  - **หมายเหตุ:** ใช้ `openssl rand -base64 32` เป็นวิธีที่แนะนำในการ Generate `NEXTAUTH_SECRET` เนื่องจากมีความโปร่งใสและควบคุมได้มากกว่า CLI ของ `auth.js`.

- **การกำหนด Schema ใน **`prisma/schema.prisma`**:**

  - เพิ่ม `model User`, `Account`, `Session`, `VerificationToken` ที่จำเป็นสำหรับ NextAuth.js.

  - **การปรับปรุง Schema ที่สำคัญ:**

    - `generator client`** output:** แก้ไขปัญหา `PrismaClient did not initialize` โดยการ **นำ **`output`** ออกจาก **`generator client` ใน `schema.prisma` เพื่อให้ Prisma Client ถูก Generate ไปยัง `node_modules/@prisma/client` ซึ่งเป็น Default Location ที่ Next.js Resolver รู้จัก.

    - เปลี่ยนชื่อฟิลด์ `emailVerified` เป็น `emailVerifiedAt` (DateTime?) ใน `User` model เพื่อความหมายที่ชัดเจนขึ้นและรองรับการบันทึกเวลา.

    - เพิ่มฟิลด์ `isActive` (Boolean, `@default(true)`) และ `preferredLanguage` (String?) ใน `User` model เพื่อรองรับสถานะผู้ใช้และภาษา UI ที่ต้องการ.

    - **สำหรับ RBAC (**`Role`**, **`Permission`**, **`RolePermission`**):**

      - เพิ่มฟิลด์ `key` (String `@unique`) ใน `Role` และ `Permission` Models เพื่อเป็นตัวระบุทางเทคนิคที่ไม่เปลี่ยนแปลง (สำหรับ Lookup ในโค้ด).

      - ใช้ `String` type สำหรับ `Role.name`, `Permission.action`, `Permission.resource` (แทน `enum`) เพื่อให้สามารถจัดการค่าเหล่านี้ได้แบบ **Dynamic** ผ่าน Admin UI ในอนาคต โดยไม่ต้องแก้ไขโค้ดหรือรัน Migration เมื่อมีการเพิ่มบทบาท/สิทธิ์ใหม่ๆ.

      - เพิ่มฟิลด์ `isSystem` (Boolean, `@default(false)`) ใน `Role` และ `Permission` Models เพื่อทำเครื่องหมายบทบาท/สิทธิ์หลักของระบบที่ควรได้รับการป้องกัน.

      - เพิ่ม `@@index([name])` ใน `Role` Model เพื่อปรับปรุงประสิทธิภาพการค้นหา.

    - ใช้ `@db.Text` สำหรับ `refresh_token`, `access_token`, `id_token` ใน `Account` model และเพิ่ม `@@index([userId])` ใน `Account` และ `Session` เพื่อประสิทธิภาพ.

  - **การสร้าง Prisma Client Instance:**

    - สร้างไฟล์ `src/lib/prisma.ts` เพื่อจัดการ Global Prisma Client Instance (ใช้ `import { PrismaClient } from '@prisma/client';` ซึ่งสอดคล้องกับ Default Output Path).

### 3. การดำเนินการ Database Migration

- **รัน Migration ครั้งแรก:**

  - รัน `pnpm prisma migrate dev --name init-auth` (ซึ่งเป็น Migration แรกสำหรับ User/Auth Models) และ Migration อื่นๆ ที่ตามมาเพื่อปรับใช้การเปลี่ยนแปลง Schema ทั้งหมดกับฐานข้อมูล Supabase (เช่น `add-rbac-keys`, `add-is-system-flag-to-rbac`, `add-user-status-and-language` ซึ่งเป็นชื่อที่ใช้ในการบันทึกการเปลี่ยนแปลง Schema ที่เราคุยกัน).
  - ยืนยันว่าไฟล์ Migration ถูกสร้างขึ้น และ Database ถูกปรับใช้สำเร็จ.

- **Generate Prisma Client:**

  - ยืนยันว่า Prisma Client ถูก Generate โดยอัตโนมัติ หรือรัน `pnpm prisma generate` ด้วยตนเอง (ซึ่งสำคัญเมื่อมีการแก้ไข Schema).

- **ตรวจสอบใน Supabase:**

  - เข้าสู่ Supabase Dashboard -> Table Editor และยืนยันว่าตารางทั้งหมด (User, Account, Session, VerificationToken, Role, Permission, RolePermission, และ `_prisma_migrations`) ถูกสร้างขึ้นอย่างถูกต้อง.

  - **หมายเหตุ:** พบปัญหาในการใช้ Prisma Studio ในบางครั้ง (เช่น ไม่แสดง Dropdown, การ Sync ข้อมูล) จึงเลือกแก้ไข/เพิ่มข้อมูลโดยตรงใน Supabase Dashboard เพื่อความสะดวกในการ Seeding Data สำหรับทดสอบ RBAC.
