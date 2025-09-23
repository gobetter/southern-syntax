# Checklist สำหรับ Phase 3: โครงสร้างพื้นฐานเนื้อหา

นี่คือ Checklist สำหรับติดตามความคืบหน้าของขั้นตอนนี้ครับ

## 1. การพัฒนา Core Data Models และ Services

### 1.1 การผสานรวม tRPC

- [ ] ติดตั้ง tRPC Packages: `pnpm add @trpc/server @trpc/react-query @trpc/client @tanstack/react-query zod`.
- [ ] สร้างไฟล์ `src/server/trpc.ts` สำหรับ tRPC Context และ Initializer (รวม `publicProcedure`, `protectedProcedure`, `authorizedProcedure`).
- [ ] สร้างไฟล์ `src/server/routers/_app.ts` สำหรับ Root tRPC Router.
- [ ] สร้างไฟล์ `src/app/api/trpc/[trpc]/route.ts` สำหรับ Next.js API Endpoint ของ tRPC.
- [ ] สร้างไฟล์ `src/lib/trpc-client.ts` สำหรับ tRPC Frontend Client.
- [ ] สร้างไฟล์ `src/lib/trpc-provider.tsx` สำหรับห่อหุ้ม `App` Component ด้วย `TRPCProvider`.
- [ ] ปรับปรุง `src/app/layout.tsx` เพื่อห่อหุ้มด้วย `TRPCProvider`.
- [ ] ปรับปรุง `src/types/next-auth.d.ts` เพื่อเพิ่ม `preferredLanguage`, `roleId`, `roleKey`, `permissions` ใน Session User และ JWT types.
- [ ] ปรับปรุง `src/lib/auth/options.ts` เพื่อใส่ `roleId`, `roleKey`, `permissions`, `preferredLanguage` ลงใน JWT/Session callbacks.

### 1.2 การกำหนด Prisma Schema เพิ่มเติม (สำหรับ Content Models)

- [ ] สร้างไฟล์ `src/types/i18n.d.ts` สำหรับ `LocalizedString` Type.
- [ ] แก้ไขไฟล์ `prisma/schema.prisma`:
  - [ ] เพิ่ม `model Language`.
  - [ ] เพิ่ม Models สำหรับ `Product`, `ProductCategory`, `ProductImage`.
  - [ ] เพิ่ม Models สำหรับ `Post`, `PostCategory`, `PostTag`.
  - [ ] เพิ่ม `Media` Model (รวม `isSystem` flag, `variants` JSONB).
  - [ ] (ตัวเลือกเสริม) เพิ่ม `AuditLog` Model (สำหรับพิจารณาในอนาคต).
- [ ] รัน Migration ใหม่สำหรับ Schema ที่เพิ่มเข้ามา.

### 1.3 การสร้าง Service Layer และ tRPC Routers (สำหรับ Core Content Models)

- [ ] สร้างโฟลเดอร์ `src/services/` (หรือใช้ `src/lib/` สำหรับ Services) และ `src/server/routers/content/`.
- [ ] สร้าง Services สำหรับ `Product` (พร้อม Zod Schema), `ProductCategory`, `Post`, `PostCategory`, `PostTag`, `Media`, `Language`.
- [ ] สร้าง tRPC Routers สำหรับ `Product`, `Category`, `Post`, `Media`, `Language` (พร้อม `publicProcedure`, `protectedProcedure`, `authorizedProcedure`).
- [ ] ปรับปรุง `src/server/routers/_app.ts` เพื่อรวม Routers ใหม่.

## 2. การพัฒนาระบบจัดการภาษา (i18n & l10n)

- [ ] ติดตั้ง Library i18n: `pnpm add i18next react-i18next`. (และ `next-intl` ถ้าเลือกใช้)
- [ ] สร้างไฟล์ `src/i18n.ts` สำหรับ Config หลักของ `i18next`.
- [ ] สร้าง `src/middleware.ts` สำหรับ i18n Routing (Next.js App Router).
- [ ] สร้างไฟล์ `src/i18n-config.ts` (สำหรับการส่งผ่านภาษาไปยัง Server Components).
- [ ] ปรับปรุง `src/app/[lang]/layout.tsx` (ย้าย Layout/Page เข้าไปใน `[lang]/`).
- [ ] ปรับปรุง `src/app/auth/signin/page.tsx` และ `src/app/admin/dashboard/page.tsx` เพื่อใช้การแปล Static Text (ด้วย `useTranslation`).
- [ ] สร้าง Service สำหรับ Language (หากยังไม่มี).
- [ ] สร้าง tRPC Router สำหรับ Language (หากยังไม่มี).

## 3. การพัฒนาระบบจัดการรูปภาพ (Media Asset Management)

### 3.1 การกำหนดค่า Cloud Storage (Supabase Storage)

- [ ] ติดตั้ง Supabase JS Client: `pnpm add @supabase/supabase-js`.
- [ ] กำหนดค่า Supabase Client: สร้างไฟล์ `src/lib/supabase-client.ts`.
- [ ] เพิ่ม Environment Variables ใน `.env` สำหรับ Supabase URL/Anon Key.
- [ ] สร้าง Storage Bucket ใน Supabase Dashboard.
- [ ] สร้าง Policy สำหรับ Bucket.

### 3.2 การดำเนินการ Image Processing (`sharp`)

- [ ] ติดตั้ง `sharp`: `pnpm add sharp && pnpm add -D @types/sharp`.
- [ ] สร้าง Service สำหรับ Image Processing (`src/services/image-processing.ts`).

### 3.3 การสร้าง API สำหรับ Media (tRPC Router)

- [ ] สร้าง Service สำหรับ Media File Upload/Management (`src/services/media.ts`).
- [ ] ปรับปรุง `@southern-syntax/rbac` เพื่อเพิ่ม `MEDIA` ใน `PERMISSION_RESOURCES`.
- [ ] สร้าง tRPC Router สำหรับ Media (`src/server/routers/content/media.ts`).
- [ ] ปรับปรุง `src/server/routers/_app.ts` เพื่อรวม Media Router.

### 3.4 การสร้าง Admin UI สำหรับ Media Library

- [ ] วางแผนสร้างหน้า Admin UI ใน `src/app/[lang]/admin/media/page.tsx` เพื่อแสดงผลและจัดการ Media.
- [ ] **หมายเหตุ:** การอัปโหลดไฟล์ผ่าน tRPC อาจซับซ้อน (ไม่รองรับ `multipart/form-data` โดยตรง) อาจต้องสร้าง Next.js Route Handler (REST API) แยกต่างหากสำหรับการอัปโหลดไฟล์ และใช้ tRPC สำหรับ metadata.
