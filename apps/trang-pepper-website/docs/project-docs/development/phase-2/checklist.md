# ✅ Checklist สำหรับ Phase 2: การจัดการผู้ใช้และการเข้าถึงหลัก

## 1. การกำหนดค่าระบบยืนยันตัวตน (Authentication ด้วย NextAuth.js)

- [x] ติดตั้ง `next-auth` และ `@auth/prisma-adapter`: `pnpm add next-auth @auth/prisma-adapter`.
- [x] สร้าง Secret Key และเพิ่มลงใน `.env` (`NEXTAUTH_SECRET`).
  - **วิธีการ:** ใช้ `openssl rand -base64 32` (แนะนำ) หรือ `pnpm dlx @auth/core@latest secret`.
- [x] ติดตั้ง `zod`: `pnpm add zod`.
- [x] ติดตั้ง `bcryptjs`: `pnpm add bcryptjs @types/bcryptjs -D`.
- [x] สร้างไฟล์ `src/lib/auth/constants.ts` เพื่อกำหนด `const` objects สำหรับ `ROLE_NAMES`, `PERMISSION_ACTIONS`, `PERMISSION_RESOURCES` และ Type aliases.
- [x] สร้างไฟล์ `src/lib/auth/schemas.ts` เพื่อกำหนด Zod Schema สำหรับ `credentialsSchema`, `roleSchema`, `permissionSchema`, `rolePermissionSchema` และ Type inferencing.
- [x] สร้างไฟล์ `src/lib/auth/service.ts` เพื่อแยก Logic การตรวจสอบ Credentials (`authenticateUser`).
- [x] สร้างไฟล์ `src/lib/auth/utils.ts` เพื่อรวม `hashPassword`, `verifyPassword`, `getUserPermissions`, `can` functions.
- [x] สร้างไฟล์ `src/lib/auth/options.ts` (เดิม `src/lib/auth.ts`) และกำหนดค่า `authOptions` (Adapter, Session Strategy, Credentials Provider, Callbacks).
  - **การปรับปรุง:** ผสานรวม `authenticateUser` จาก `service.ts` และใช้ `verifyPassword` จาก `utils.ts`.
- [x] สร้างไฟล์ `src/lib/auth/index.ts` เพื่อ Re-export ทุกอย่างจาก `auth/` folder.
- [x] สร้าง API Route สำหรับ NextAuth.js: `src/app/api/auth/[...nextauth]/route.ts`.
  - **การปรับปรุง:** `import { authOptions } from '@/lib/auth';`
- [x] สร้าง `src/types/next-auth.d.ts` เพื่อขยาย Type ของ Session และ JWT.
- [x] สร้าง `SessionProviderWrapper.tsx` และแก้ไข `src/app/layout.tsx` เพื่อห่อหุ้ม `SessionProvider`.
- [x] สร้างหน้า Login ที่กำหนดเอง: `src/app/auth/signin/page.tsx` (ติดตั้ง `Input` ของ Shadcn UI).

## 2. การพัฒนาระบบจัดการสิทธิ์ (Authorization - RBAC)

- [x] ขยาย Schema ใน `prisma/schema.prisma`.
  - **การปรับปรุง:**
    - เปลี่ยนชื่อฟิลด์ `emailVerified` เป็น `emailVerifiedAt`.
    - เพิ่มฟิลด์ `isActive` และ `preferredLanguage` ใน `User` model.
    - สำหรับ RBAC (`Role`, `Permission`, `RolePermission`): เพิ่มฟิลด์ `key` (String @unique), `isSystem` Boolean flag, และใช้ `String` type สำหรับ `Role.name`, `Permission.action`, `Permission.resource` (แทน `enum`).
    - เพิ่ม `@@index` บนฟิลด์ที่เหมาะสม (เช่น `User.roleId`, `Role.name`, `Role.key`, `Permission.action`, `Permission.resource`, `Permission.key`).
- [x] รัน Migration ใหม่สำหรับ RBAC Schema และการเปลี่ยนแปลงอื่นๆ.
  - **คำสั่งที่ใช้:** `pnpm prisma migrate dev --name init-auth` (สำหรับ Migration แรก), `pnpm prisma migrate dev --name add-rbac-keys` (สำหรับ key/isSystem), `pnpm prisma migrate dev --name add-user-status-and-language` (สำหรับ isActive/preferredLanguage)
  - **ยืนยัน:** `pnpm prisma generate` เพื่อให้ Prisma Client เป็นเวอร์ชันล่าสุด.
- [x] ใช้ `getUserPermissions` และ `can` function ใน `src/lib/auth/utils.ts`.
  - **การปรับปรุง:** ผสานรวม Logic จาก `authz-utils.ts` เดิม, และใช้ Type ที่ถูกต้องจาก `src/lib/auth/constants.ts` (เช่น `PERMISSION_RESOURCES.ADMIN_DASHBOARD`, `PERMISSION_ACTIONS.READ`).
- [x] (ตัวอย่าง) ป้องกันหน้า Admin Dashboard หรือ API Route เบื้องต้นโดยใช้ `getServerSession` และ `can` function.
  - **ยืนยัน:** การทดสอบ Unauthenticated Access, Unauthorized Access, และ Authorized Access ทำงานได้อย่างถูกต้อง (โดยใช้ Supabase Dashboard ในการ Seeding Data แทน Prisma Studio).
