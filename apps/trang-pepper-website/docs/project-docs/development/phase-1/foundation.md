# Phase 1: การวางรากฐาน (Foundation Setup)

## 1. การตั้งค่าโครงการ Next.js ขั้นต้น

การเริ่มต้นโครงการประกอบด้วยการสร้างโปรเจกต์ Next.js ใหม่ พร้อมกำหนดค่าเริ่มต้นสำหรับ TypeScript (strict mode) และ App Router เพื่อให้ได้โครงสร้างที่ทันสมัยและมีประสิทธิภาพ การใช้ **TypeScript ในโหมด Strict** จะช่วยให้โค้ดมีความน่าเชื่อถือสูงขึ้นอย่างมาก ด้วยการบังคับใช้ Type Safety ที่เข้มงวด ส่งผลให้สามารถตรวจจับข้อผิดพลาดที่เกี่ยวกับชนิดข้อมูลได้ตั้งแต่ขั้นตอนการพัฒนา (compile-time) ซึ่งก่อให้เกิดความแข็งแกร่งของรหัสโปรแกรม ลดโอกาสการเกิดข้อผิดพลาดขณะทำงาน (runtime errors) และอำนวยความสะดวกอย่างยิ่งต่อกระบวนการบำรุงรักษาโค้ดในระยะยาว นอกจากนี้ โครงสร้างโค้ดที่ชัดเจนจากการใช้ TypeScript ยังช่วยให้การพัฒนาขนาดใหญ่ (large-scale development) มีความคล่องตัวขึ้น และส่งเสริมการทำงานร่วมกันภายในทีมได้ดียิ่งขึ้น โดยลดความคลุมเครือในการตีความชนิดข้อมูลและพฤติกรรมของฟังก์ชัน

- **การสร้างโครงการ Next.js:**

```bash
pnpm create next-app@latest trang-pepper-cms --typescript --app --eslint --tailwind --src --no-turbopack --no-custom-alias
```

คำสั่งนี้จะทำการติดตั้งโครงสร้างโครงการ Next.js ที่รองรับ TypeScript, App Router, ESLint, Tailwind CSS, ใช้ `src/` directory, ไม่ใช้ Turbopack สำหรับ `next dev` และใช้ Import Alias แบบ Default (`@/*`) ซึ่งเป็นเครื่องมือสำหรับตรวจสอบคุณภาพโค้ดและช่วยบังคับใช้ Coding Standards ตั้งแต่เริ่มต้น ทำให้โค้ดมีความสะอาดและเป็นระเบียบ

**หมายเหตุ:** แม้จะใช้คำสั่งด้านบนนี้ `create-next-app` อาจจะยังคงถามคำถามบางอย่างเพื่อยืนยัน (เช่น `Would you like your code inside a 'src/' directory?` และ `Would you like to customize the import alias (@/* by default)?`) โปรดเลือก `Yes` สำหรับ `src/` directory และ `No` สำหรับการ customize import alias ตามการตั้งค่าที่ได้ตกลงกันไว้

- **การกำหนดค่า Tailwind CSS:** การกำหนดค่าที่จำเป็นสำหรับ **Tailwind CSS** ควรดำเนินการในระยะนี้ ซึ่งเป็น Framework สำหรับการจัดสไตล์ CSS ที่ช่วยให้สามารถสร้างส่วนติดต่อผู้ใช้ (UI) ได้อย่างรวดเร็วและยืดหยุ่น โดยการใช้ Utility Classes ใน HTML โดยตรง การนำ Tailwind CSS มาใช้ตั้งแต่เริ่มต้นจะช่วยให้มั่นใจได้ถึงความสอดคล้องของดีไซน์ทั่วทั้ง Application ลดความซับซ้อนของการเขียน CSS แบบดั้งเดิม และเร่งกระบวนการออกแบบและพัฒนาส่วนติดต่อผู้ใช้ให้เป็นไปอย่างมีประสิทธิภาพ นอกจากนี้ยังสนับสนุนการสร้าง Responsive Design ที่ปรับขนาดได้ตามอุปกรณ์ต่างๆ อย่างสะดวก และช่วยลดขนาดของไฟล์ CSS ที่ส่งไปยัง Client โดยการกำจัด Styles ที่ไม่ได้ใช้งาน (purging)

- **การกำหนดค่า ESLint และ Prettier:** การตั้งค่า ESLint และ Prettier จะช่วยให้โค้ดของคุณมีมาตรฐานและสอดคล้องกันทั่วทั้งโปรเจกต์

  - **ESLint:** Next.js จะติดตั้งและกำหนดค่า ESLint ให้แล้ว คุณสามารถปรับแต่งให้ใช้ `eslint.config.mjs` ในรูปแบบ Flat Config ได้ เพื่อเพิ่มกฎ (rules) ที่เข้มงวดมากขึ้น
    - **ข้อควรจำ:** เนื่องจากคุณไม่ต้องการให้ใช้ `any` ให้กำหนดค่า ESLint ให้แจ้งเตือนเมื่อมีการใช้ `any` หรือใช้ type ที่ไม่ชัดเจน
    - **การแก้ไขปัญหาที่พบเจอ:** แก้ไขปัญหา `tslint is not defined` (Typo `tslint` เป็น `tseslint`), `nextPlugin is not defined` (โดยเพิ่ม `import nextPlugin from '@next/eslint-plugin-next';`), ปัญหา `extends` และ `plugins` key ใน Flat Config (ปรับโครงสร้าง `eslint.config.mjs` ให้ถูกต้อง), และปัญหา `@rushstack/eslint-patch` (โดยการลบแพ็กเกจและโค้ดที่เกี่ยวข้อง).
  - **Prettier:**
    - **ติดตั้ง:** `pnpm add -D prettier eslint-config-prettier eslint-plugin-prettier prettier-plugin-tailwindcss`
    - **สร้างไฟล์ `.prettierrc`:** กำหนดค่าการจัดรูปแบบ เช่น `singleQuote: true`,`semi: true`,`tabWidth: 2`,`trailingComma: 'all'`,`printWidth: 100`, และเพิ่ม `plugins: ["prettier-plugin-tailwindcss"]` (ถ้าใช้ Tailwind).
    - **เพิ่ม Prettier ลงใน `eslint.config.mjs`:** ผสานรวม `eslint-config-prettier` และ `eslint-plugin-prettier` ในรูปแบบ Flat Config โดยวาง `eslintConfigPrettier` และ `eslintPluginPrettierRecommended` ไว้ท้ายสุดใน `export default []` เพื่อให้ Prettier ควบคุมการจัดรูปแบบ.
  - **การตั้งค่า Editor (VS Code):** ตั้งค่า `editor.formatOnSave: true` และ `editor.codeActionsOnSave` เพื่อให้ Editor จัดรูปแบบและแก้ไขข้อผิดพลาด ESLint อัตโนมัติเมื่อบันทึก.

- **การจัดการ Dependencies (อื่นๆ):**

  - **Shadcn UI:** ติดตั้ง `shadcn/ui` ด้วย `pnpm dlx shadcn@latest init` (อัปเดตคำสั่งจาก `shadcn-ui`) และเพิ่ม Component ตัวอย่าง (เช่น `button`, `input`).
  - **Zod:** ติดตั้ง `zod` สำหรับ Schema Validation และ Type Inferencing.
  - **bcryptjs:** ติดตั้ง `bcryptjs` สำหรับ Password Hashing.

- **การตั้งค่าโครงสร้างโฟลเดอร์เริ่มต้น (Initial Folder Structure):**

  - **App Router:** โครงสร้างโฟลเดอร์หลักจะอยู่ใน `app/` ภายใต้ `src/`.
  - **โครงสร้าง `src/lib/` (Modularization):**

    - สร้างโฟลเดอร์ `src/lib/auth/` เพื่อจัดกลุ่มไฟล์เกี่ยวกับ Authentication และ Authorization.
    - ย้ายไฟล์ `auth.ts` (เปลี่ยนเป็น `index.ts`), `auth-schemas.ts` (เปลี่ยนเป็น `schemas.ts`), `auth-service.ts` (เปลี่ยนเป็น `service.ts`), `auth-utils.ts` (เปลี่ยนเป็น `utils.ts`), และ `authz-utils.ts` เข้าไปใน `src/lib/auth/`.
    - รวมเนื้อหาของ `auth-utils.ts` และ `authz-utils.ts` เข้าไปใน `src/lib/auth/utils.ts`.
    - ไฟล์ `src/lib/auth/index.ts` จะทำหน้าที่ Re-export ทุกอย่างเพื่อให้การ Import ภายนอกดูสะอาดตา (เช่น `import { authOptions, can } from '@/lib/auth';`).
    - ปรับปรุง `import` paths ทั้งหมดที่เกี่ยวข้องให้ถูกต้องตามโครงสร้างใหม่.

  - **โฟลเดอร์เอกสาร (`docs/`)**: จัดโครงสร้าง `docs/` เป็น `docs/project-docs/` (สำหรับแผนงาน/การออกแบบ), `docs/setup/` (สำหรับคู่มือการตั้งค่า), และ `docs/guides/` (สำหรับคู่มือเครื่องมือ/เทคนิค)

- **การทดสอบการตั้งค่าเบื้องต้น (Initial Setup Testing):**
  - รัน `pnpm dev` และยืนยันว่า Development Server ทำงานปกติ.
  - ทดสอบ Hot Module Replacement (HMR).
  - ยืนยันว่า Vitest ถูกตั้งค่าถูกต้อง, มีไฟล์ทดสอบตัวอย่าง และ `pnpm exec vitest run` ผ่าน.

## 2. การกำหนดค่าฐานข้อมูล (Supabase PostgreSQL) และ ORM (Prisma)

ในขั้นตอนนี้ เราได้ทำการติดตั้งและกำหนดค่าฐานข้อมูล PostgreSQL โดยใช้ Supabase (Free Tier) และ ORM อย่าง Prisma เพื่อให้โปรเจกต์ Next.js ของคุณสามารถสื่อสารกับฐานข้อมูลได้ และได้เริ่มกำหนด Schema สำหรับ User (ผู้ดูแลระบบ) เบื้องต้น

### 2.1. การเตรียม Supabase Project (Free Tier)

เราใช้ Supabase เป็นผู้ให้บริการ PostgreSQL Database หลักของคุณ พร้อมกับ File Storage ในตัว

- **ลงทะเบียนและสร้าง Project ใน Supabase:** ไปที่เว็บไซต์ Supabase, ลงทะเบียน, สร้าง Project ใหม่ (ตั้งชื่อ, รหัสผ่าน Database, Region), และเลือก Pricing Plan "Free" หรือ "Spark Plan".
- **คัดลอก Connection String:** คัดลอก URI Connection String จาก Supabase Dashboard.
  - **หมายเหตุ:** เลือก Supabase เป็น Database Provider หลัก แทน Docker สำหรับ Local Development เพื่อความยืดหยุ่น, Scalability, และ File Storage ในตัว.

### 2.2. การติดตั้ง Prisma CLI และ Prisma Client

Prisma ประกอบด้วยสองส่วนหลัก: Prisma CLI (สำหรับจัดการ Migration, Generate Client) และ Prisma Client (สำหรับโต้ตอบกับฐานข้อมูลในโค้ดของคุณ)

- **ติดตั้ง Prisma CLI:** `pnpm add -D prisma`.
- **ติดตั้ง Prisma Client:** `pnpm add @prisma/client`.

### 2.3. การ Initializing Prisma ในโปรเจกต์

หลังจากติดตั้ง Prisma แล้ว เราทำการ Initializing เพื่อสร้างไฟล์การตั้งค่าที่จำเป็น

- **รันคำสั่ง Prisma Init:** `pnpm prisma init` ซึ่งจะสร้างโฟลเดอร์ `prisma/` และไฟล์ `schema.prisma` รวมถึงอัปเดตไฟล์ `.env` พร้อม `DATABASE_URL` ตัวอย่าง.

### 2.4. การกำหนดค่า .env สำหรับ Database Connection

Prisma ใช้ `DATABASE_URL` ที่อยู่ในไฟล์ `.env` เพื่อเชื่อมต่อกับฐานข้อมูล

- **เปิดไฟล์ `.env`:** ที่ root ของโปรเจกต์.
- **กำหนดค่า `DATABASE_URL`:** แทนที่ `DATABASE_URL` ด้วย Connection String ที่คัดลอกมาจาก Supabase.
  - **หมายเหตุ:** ใช้ `openssl rand -base64 32` เป็นวิธีที่แนะนำในการ Generate `NEXTAUTH_SECRET` เนื่องจากมีความโปร่งใสและควบคุมได้มากกว่า CLI ของ `auth.js`.

### 2.5. การกำหนด Schema ใน prisma/schema.prisma (สำหรับ User Model และ RBAC)

เราได้เริ่มออกแบบฐานข้อมูลโดยกำหนด Models ใน `prisma/schema.prisma`

- **กำหนด `datasource` และ `generator`:** ตรวจสอบว่า `provider` ของ `datasource` เป็น `"postgresql"` และ `generator` เป็น `client` และ `provider` เป็น `"prisma-client-js"`.
  - **การแก้ไข `generator client` output:** แก้ไขปัญหา `PrismaClient did not initialize` โดยการ **นำ `output` ออกจาก `generator client`** ใน `schema.prisma` เพื่อให้ Prisma Client ถูก Generate ไปยัง `node_modules/@prisma/client` ซึ่งเป็น Default Location ที่ Next.js Resolver รู้จัก.
- **กำหนด Model `User` และ NextAuth.js Models (Account, Session, VerificationToken):**
  - **ปรับปรุง Schema ที่สำคัญ:**
    - เปลี่ยนชื่อฟิลด์ `emailVerified` เป็น **`emailVerifiedAt`** (DateTime?) ใน `User` model เพื่อความหมายที่ชัดเจนขึ้นและรองรับการบันทึกเวลา.
    - เพิ่มฟิลด์ **`isActive`** (Boolean, `@default(true)`) และ **`preferredLanguage`** (String?) ใน `User` model เพื่อรองรับสถานะผู้ใช้และภาษา UI ที่ต้องการ.
    - ใช้ `@db.Text` สำหรับ `refresh_token`, `access_token`, `id_token` ใน `Account` model และเพิ่ม `@@index([userId])` ใน `Account` และ `Session` เพื่อประสิทธิภาพ.
- **กำหนด Models สำหรับ Role-Based Access Control (RBAC):** เพิ่ม `model Role`, `Permission`, `RolePermission`
  - **การออกแบบ Schema เพื่อความยืดหยุ่นและรองรับหลายภาษา:**
    - เพิ่มฟิลด์ **`key`** (String `@unique`) ใน `Role` และ `Permission` Models เพื่อเป็นตัวระบุทางเทคนิคที่ไม่เปลี่ยนแปลง (สำหรับ Lookup ในโค้ด).
    - ใช้ **`String`** type สำหรับ `Role.name`, `Permission.action`, `Permission.resource` (แทน `enum` ใน `schema.prisma`) เพื่อให้สามารถจัดการค่าเหล่านี้ได้แบบ **Dynamic** ผ่าน Admin UI ในอนาคต โดยไม่ต้องแก้ไขโค้ดหรือรัน Migration เมื่อมีการเพิ่มบทบาท/สิทธิ์ใหม่ๆ.
    - เพิ่มฟิลด์ **`isSystem`** (Boolean, `@default(false)`) ใน `Role` และ `Permission` Models เพื่อทำเครื่องหมายบทบาท/สิทธิ์หลักของระบบที่ควรได้รับการป้องกัน.
    - เพิ่ม `@@index([name])` และ `@@index([key])` ใน `Role` Model, และ `@@index([action])`, `@@index([resource])`, `@@index([key])` ใน `Permission` Model เพื่อปรับปรุงประสิทธิภาพการค้นหา.
  - **การตัดสินใจไม่รองรับ Multi-role ในตอนนี้:** ยึดถือแนวทาง "User มี 1 Role" และจดบันทึกไว้เป็นการขยายระบบในอนาคต

### 2.6. การสร้าง Prisma Client Instance

เราได้สร้าง Global Prisma Client instance เพื่อให้มั่นใจว่าแอปพลิเคชันของคุณมี Prisma Client เพียงตัวเดียว และหลีกเลี่ยงปัญหา Hot Module Reloading (HMR) ใน Development ครับ

- **สร้างไฟล์ `src/lib/prisma.ts`:** เพิ่มโค้ดสำหรับสร้าง Global Prisma Client Instance (ใช้ `import { PrismaClient } from '@prisma/client';` ซึ่งสอดคล้องกับ Default Output Path).

## 3. การดำเนินการ Database Migration

ในขั้นตอนนี้ เราได้ใช้ Prisma CLI เพื่อสร้างโครงสร้างตารางในฐานข้อมูล Supabase ตาม Schema ที่คุณได้นิยามไว้ ซึ่งเป็นสิ่งจำเป็นและเป็นขั้นตอนสำคัญในการควบคุมเวอร์ชันของฐานข้อมูลอย่างเป็นระบบและสามารถติดตามการเปลี่ยนแปลงได้

### 3.1 การรัน Migration ครั้งแรก

เราได้ใช้คำสั่ง `prisma migrate dev` เพื่อสร้างไฟล์ Migration และนำการเปลี่ยนแปลง Schema ไปปรับใช้กับฐานข้อมูล

- **ตรวจสอบสถานะ Database Connection:** ตรวจสอบ `DATABASE_URL` ในไฟล์ `.env` และ Supabase Project ให้พร้อม.
- **รันคำสั่ง Prisma Migrate Dev:** รัน `pnpm prisma migrate dev --name init-auth` (ซึ่งเป็น Migration แรกสำหรับ User/Auth Models) และ Migration อื่นๆ ที่ตามมาเพื่อปรับใช้การเปลี่ยนแปลง Schema ทั้งหมดกับฐานข้อมูล Supabase (เช่น `add-rbac-keys`, `add-is-system-flag-to-rbac`, `add-user-status-and-language` ซึ่งเป็นชื่อที่ใช้ในการบันทึกการเปลี่ยนแปลง Schema ที่เราคุยกัน).

### 3.2 การ Generate Prisma Client (หากไม่ได้เกิดขึ้นอัตโนมัติ)

- ยืนยันว่า Prisma Client ถูก Generate โดยอัตโนมัติ หรือรัน `pnpm prisma generate` ด้วยตนเอง (ซึ่งสำคัญเมื่อมีการแก้ไข Schema).

### 3.3 การตรวจสอบ Migration ใน Supabase

- เข้าสู่ Supabase Dashboard -> Table Editor และยืนยันว่าตารางทั้งหมด (User, Account, Session, VerificationToken, Role, Permission, RolePermission, และ `_prisma_migrations`) ถูกสร้างขึ้นอย่างถูกต้อง.
- **หมายเหตุ:** พบปัญหาในการใช้ Prisma Studio ในบางครั้ง (เช่น ไม่แสดง Dropdown, การ Sync ข้อมูล) จึงเลือกแก้ไข/เพิ่มข้อมูลโดยตรงใน Supabase Dashboard เพื่อความสะดวกในการ Seeding Data สำหรับทดสอบ RBAC.

---

## 4. การทดสอบการตั้งค่าเบื้องต้น (Initial Setup Testing)

- **รัน Development Server:** `pnpm dev` และยืนยันว่า Development Server ทำงานปกติ.
- **ทดสอบ Hot Module Replacement (HMR):** ลองแก้ไขไฟล์โค้ดและดูการเปลี่ยนแปลงในเบราว์เซอร์.
- **ทดสอบ ESLint และ Prettier:** ตั้งค่า Editor (VS Code) เพื่อ `formatOnSave` และ `fixAll.eslint` และยืนยันว่า `pnpm run lint` และ `pnpm format` ทำงานได้โดยไม่มีข้อผิดพลาด.
- **ทดสอบ Vitest:** ยืนยันว่า Vitest ถูกตั้งค่าถูกต้อง, มีไฟล์ทดสอบตัวอย่าง และ `pnpm exec vitest run` ผ่าน.
- **ทดสอบการป้องกัน Route (Unauthenticated & Unauthorized Access):**
  - ตรวจสอบว่าผู้ใช้ที่ไม่ได้ Login ถูก Redirect ไปหน้า Login.
  - จัดเตรียมข้อมูลเริ่มต้น (Role, Permission, User) ใน Supabase Dashboard.
  - ตรวจสอบว่าผู้ใช้ที่ Login แล้ว แต่ไม่มีสิทธิ์ถูก Redirect.
  - ตรวจสอบว่าผู้ใช้ที่ Login แล้ว และมีสิทธิ์สามารถเข้าถึงหน้า Admin ได้.

---

## สรุปแนวคิด

ทำให้ Foundation (Phase 1) เรียบง่าย เสถียร และ Reusable แล้วจึงค่อยขยายไปยัง Testing, Auth, CMS logic ใน Phase ถัดไป

---

## ผู้จัดทำ

- Isara Chumsri (2024–2025)
- Codex + ChatGPT (ระบบผู้ช่วยร่วมพัฒนา)
