# 📁 โครงสร้างโฟลเดอร์ในโปรเจกต์ `src/`

เอกสารนี้อธิบายโครงสร้างโฟลเดอร์ภายใน `src/` ของโปรเจกต์ `trang-pepper-cms` ซึ่งเป็นไปตาม Best Practice สำหรับ Next.js (App Router) และ TypeScript เพื่อความชัดเจน, การบำรุงรักษา, และการขยายระบบ

---

## `src/app/`

📁 `src/app/` - รากของระบบ Routing ใน Next.js (App Router)

เป็นจุดเริ่มต้นสำหรับ Route Segment ของ App Router และเป็นที่อยู่ของไฟล์ Layout, Page, และ Route Handlers (API routes) รวมถึง `globals.css` และ `favicon.ico`

---

## `src/components/`

📁 `src/components/` - รวม UI components ที่ใช้ซ้ำได้

โฟลเดอร์นี้มีไว้สำหรับเก็บ React Components ที่สามารถนำกลับมาใช้ซ้ำได้ทั่วทั้ง Application เพื่อความเป็นระเบียบและลดความซ้ำซ้อนของโค้ด

- `src/components/ui/`: สำหรับ UI Components พื้นฐานที่มาจาก [shadcn/ui](https://ui.shadcn.com/) (เช่น Button, Input, Card) หรือ Components ที่คุณสร้างขึ้นเองตาม Design System
- `src/components/common/`: สำหรับ Components ทั่วไปที่ใช้ใน Layout หลัก เช่น Header, Footer, Navigation Bar
- `src/components/[module_name]/`: สำหรับ Components ที่เกี่ยวข้องกับโมดูลเฉพาะ (เช่น `products/ProductCard.tsx`)

---

## `src/lib/`

📁 `src/lib/` - รวม Logic ที่เกี่ยวกับ Business, API, Helpers, Utilities

โฟลเดอร์นี้มีไว้สำหรับเก็บ Logic หรือ Utility Functions ที่ไม่เกี่ยวข้องโดยตรงกับการ Render UI แต่เป็นส่วนสำคัญในการทำงานของ Application. มีการจัดหมวดหมู่ย่อยเพื่อความเป็นระเบียบ

- `src/lib/auth/`: **(โฟลเดอร์ใหม่)** สำหรับ Logic ทั้งหมดที่เกี่ยวข้องกับ Authentication และ Authorization (Auth/AuthZ).
  - `src/lib/auth/index.ts`: ไฟล์หลักสำหรับ Re-export ทุกอย่างจากโฟลเดอร์ `auth/` เพื่อให้ Import ได้ง่ายขึ้น (เช่น `import { authOptions, can } from '@/lib/auth';`).
  - `src/lib/auth/options.ts`: กำหนดค่า `NextAuthOptions` สำหรับ NextAuth.js.
  - `src/lib/auth/schemas.ts`: Zod Schemas สำหรับ Validation ของข้อมูลที่เกี่ยวข้องกับ Auth/AuthZ (เช่น Credentials, Role, Permission).
  - `src/lib/auth/service.ts`: Business Logic สำหรับการ Authentication (เช่น `authenticateUser`).
  - `src/lib/auth/utils.ts`: Utility Functions ที่เกี่ยวข้องกับ Auth/AuthZ (เช่น `hashPassword`, `verifyPassword`, `getUserPermissions`, `can`).
  - `@southern-syntax/rbac`: `const` objects และ Type aliases สำหรับค่าคงที่ของ Roles และ Permissions (เช่น `ROLE_NAMES`, `PERMISSION_ACTIONS`, `PERMISSION_RESOURCES`).
- `src/lib/prisma.ts`: Prisma Client Instance ที่ถูกตั้งค่าแบบ Global เพื่อให้ Application สามารถโต้ตอบกับฐานข้อมูลได้อย่าง Type-safe และมีประสิทธิภาพ.
- `src/lib/utils.ts`: (ถ้ามี) ฟังก์ชัน Utility ทั่วไปที่ไม่เกี่ยวข้องกับหมวดหมู่อื่นๆ เช่น `cn` function สำหรับรวม Tailwind CSS classes หรือฟังก์ชัน helpers ทั่วไป.

---

## `src/config/`

📁 `src/config/` - เก็บค่าคงที่, ตัวแปร Environment, การตั้งค่าทั่วไปของระบบ

สำหรับเก็บไฟล์ Configuration ต่างๆ ที่ใช้ทั่วทั้ง Application เช่น การตั้งค่า API URL, ค่าคงที่ของระบบ, หรือการตั้งค่าเฉพาะ Environment.

---

## `src/generated/`

📁 `src/generated/` - สำหรับโค้ดที่ถูก Generate โดยอัตโนมัติ

โฟลเดอร์นี้มีไว้สำหรับเก็บโค้ดที่ถูก Generate โดยเครื่องมือต่างๆ (เช่น Prisma Client, GraphQL Types) ซึ่งไม่ควรถูกแก้ไขด้วยมือ.

- `src/generated/prisma/`: (หากคุณเลือก Custom Output Path) สำหรับ Prisma Client ที่ถูก Generate (แต่ในโปรเจกต์นี้เราใช้ Default Output ใน `node_modules`).

---

## `src/hooks/`

📁 `src/hooks/` - รวม custom React hooks สำหรับการจัดการ state หรือ side effects

สำหรับเก็บ Custom React Hooks ที่ใช้ซ้ำได้เพื่อจัดการ Logic ของ UI หรือ Side Effects ที่ซับซ้อน.

---

## `src/styles/`

📁 `src/styles/` - ไฟล์ global CSS, Tailwind config, หรือ style utilities อื่น ๆ

สำหรับเก็บไฟล์ Styles ทั่วไป, Global CSS, หรือการตั้งค่าของ CSS Framework (เช่น Tailwind CSS).

---

## `src/types/`

📁 `src/types/` - รวม TypeScript type, interface, enum ของระบบ

สำหรับเก็บ Global TypeScript Type Definitions, Interfaces, หรือ Enums ที่ใช้ทั่วทั้งโปรเจกต์ เพื่อรักษากฎ Type Safety และความสอดคล้อง.

- `src/types/next-auth.d.ts`: ไฟล์สำหรับ [Module Augmentation](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation) เพื่อขยาย Type ของ NextAuth.js Session และ JWT ให้สอดคล้องกับ Properties ที่เราเพิ่มเข้ามา (เช่น `id`, `email`, `name`, `role`, `permissions`).

---

## `src/__tests__/`

📁 `src/__tests__/` - สำหรับไฟล์ Test Environment Setup

สำหรับเก็บไฟล์ที่เกี่ยวข้องกับการตั้งค่า Test Environment (เช่น `setupTests.ts` สำหรับ Vitest). Test files จริงๆ (`.test.tsx`) สามารถวางไว้ข้างๆ Component ที่ทดสอบได้.

---
