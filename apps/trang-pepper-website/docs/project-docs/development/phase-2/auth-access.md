# Phase 2: การจัดการผู้ใช้และการเข้าถึงหลัก (Core User & Access Management)

เฟสนี้มุ่งเน้นการสร้างระบบ Authentication และ Authorization ซึ่งเป็นรากฐานความปลอดภัยและการบริหารจัดการผู้ดูแลระบบ การดำเนินการในเฟสนี้อย่างรอบคอบจะส่งผลต่อความน่าเชื่อถือและความปลอดภัยของระบบโดยรวม

## 2.1 การกำหนดค่าระบบยืนยันตัวตน (Authentication ด้วย NextAuth.js)

ในขั้นตอนนี้ เราจะผสานรวม NextAuth.js เพื่อจัดการกระบวนการเข้าสู่ระบบและ Session ของผู้ดูแลระบบอย่างมีประสิทธิภาพ

### 2.1.1 การติดตั้ง NextAuth.js และ Prisma Adapter

เราจะติดตั้งแพ็กเกจที่จำเป็นสำหรับ NextAuth.js และ Prisma Adapter เพื่อให้ NextAuth.js สามารถทำงานร่วมกับฐานข้อมูลผ่าน Prisma ได้

#### 2.1.1.1 ติดตั้ง Packages

เปิด Terminal ในโฟลเดอร์โปรเจกต์ `trang-pepper-cms` ของคุณ และรันคำสั่ง:

```bash
pnpm add next-auth @auth/prisma-adapter
```

**คำอธิบาย:**

- `next-auth`: คือไลบรารีหลักสำหรับ Authentication (ปัจจุบันคือ Auth.js)
- `@auth/prisma-adapter`: คือ Adapter ที่ทำให้ NextAuth.js สามารถเชื่อมต่อกับฐานข้อมูลผ่าน Prisma ORM ได้

### 2.1.2 การสร้าง Secret Key สำหรับ NextAuth.js

NextAuth.js ต้องการ Secret Key เพื่อเข้ารหัสและถอดรหัส JWT (JSON Web Tokens) และเข้ารหัส Session

#### 2.1.2.1 สร้าง Secret Key

เปิด Terminal (นอกโฟลเดอร์โปรเจกต์ก็ได้) และรันคำสั่งเพื่อสร้าง Secret Key ที่ปลอดภัย:

```bash
openssl rand -base64 32
```

คุณจะได้รับ String ที่เป็น Secret Key ที่ถูก Generate ขึ้นมา (เช่น `YJrNG2Tznh8bdQeZARhmuBG8m4vAmAFh8je...`)

#### 2.1.2.2 เพิ่ม Secret Key ลงในไฟล์ **`.env`**

- เปิดไฟล์ `.env` ที่ root ของโปรเจกต์
- เพิ่มบรรทัด `NEXTAUTH_SECRET` โดยใช้ Secret Key ที่คุณ Generate มา:

```dotenv
NEXTAUTH_SECRET='<YOUR_GENERATED_SECRET_KEY>'
```

**สำคัญ:**

- แทนที่ `<YOUR_GENERATED_SECRET_KEY>` ด้วยค่าที่คุณ Generate มาจริงๆ
- ห้ามเปิดเผย Secret Key นี้ต่อสาธารณะ

### 2.1.3 การกำหนดค่า `authOptions` สำหรับ NextAuth.js

เราจะสร้างไฟล์สำหรับกำหนดค่าหลักของ NextAuth.js ซึ่งจะรวมถึง Providers, Adapter, และ Callbacks

#### 2.1.3.1 สร้างไฟล์ **`src/lib/auth.ts`**

- สร้างไฟล์ใหม่ชื่อ `auth.ts` ภายในโฟลเดอร์ `src/lib/` ของคุณ
- เพิ่มโค้ดด้านล่างนี้:

```ts
// src/lib/auth/options.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "../prisma"; // Import Prisma Client instance (จาก src/lib/prisma.ts)
import { authenticateUser } from "./service"; // Import authentication logic (จาก src/lib/auth/service.ts)
import { CredentialsInput } from "./schemas"; // Import schema types (จาก src/lib/auth/schemas.ts)

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "jsmith@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // เรียกใช้ Authentication Service ที่แยกออกมา (authenticateUser)
        const user = await authenticateUser(credentials as CredentialsInput);

        if (user) {
          return user;
        } else {
          // หาก authenticateUser คืนค่า null, โยน Error เพื่อให้ NextAuth.js จัดการและแสดงข้อความ
          throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email; // ปรับปรุง Type ใน src/types/next-auth.d.ts เพื่อรองรับ string | null | undefined
        token.name = user.name; // ปรับปรุง Type ใน src/types/next-auth.d.ts เพื่อรองรับ string | null | undefined
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email; // ปรับปรุง Type ใน src/types/next-auth.d.ts เพื่อรองรับ string | null | undefined
        session.user.name = token.name; // ปรับปรุง Type ใน src/types/next-auth.d.ts เพื่อรองรับ string | null | undefined
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  debug: process.env.NODE_ENV === "development",
};
```

### 2.1.4 การสร้าง API Route สำหรับ NextAuth.js

NextAuth.js ต้องการ API Route สำหรับจัดการ Endpoint ต่างๆ (เช่น `/api/auth/signin`, `/api/auth/callback`)

#### 2.1.4.1 สร้างไฟล์ `src/app/api/auth/[...nextauth]/route.ts`

- สร้างโครงสร้างโฟลเดอร์ `src/app/api/auth/[...nextauth]/`
- สร้างไฟล์ `route.ts` ภายในโฟลเดอร์นั้น
- เพิ่มโค้ดด้านล่างนี้:

```ts
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // Import authOptions ที่เรากำหนดไว้

// export handler สำหรับ GET และ POST requests
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

### 2.1.5 การเพิ่ม Session Provider ใน Frontend

เพื่อให้ Client Components สามารถเข้าถึงข้อมูล Session ได้ NextAuth.js ต้องการ `SessionProvider` Context

#### 2.1.5.1 แก้ไขไฟล์ `src/app/layout.tsx`

- เปิดไฟล์ `src/app/layout.tsx` (ซึ่งเป็น Root Layout ของ Next.js App Router)
- ห่อหุ้ม `<body>` ด้วย `SessionProvider`
- **สิ่งสำคัญ:** `SessionProvider` ต้องเป็น Client Component ดังนั้นเราจะสร้าง Wrapper Component แยกต่างหาก

```tsx
// src/app/SessionProviderWrapper.tsx;
("use client"); // กำหนดให้เป็น Client Component

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface SessionProviderWrapperProps {
  children: ReactNode;
}

export default function SessionProviderWrapper({
  children,
}: SessionProviderWrapperProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

```tsx
// src/app/layout.tsx
import "./globals.css";
import SessionProviderWrapper from "./session-provider-wrapper"; // Import Wrapper Component
import React from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProviderWrapper>
          {children} {/* ห่อหุ้ม children ด้วย SessionProviderWrapper */}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
```

### 2.1.6 การสร้างหน้า Login (Custom Sign-in Page)

NextAuth.js จะ redirect ไปยัง `/api/auth/signin` โดยอัตโนมัติ หากไม่มีหน้า Login ที่กำหนดเอง แต่เราได้กำหนด `pages: { signIn: '/auth/signin' }` ไว้แล้ว

#### 2.1.6.1 สร้างไฟล์ `src/app/auth/signin/page.tsx`

- สร้างโครงสร้างโฟลเดอร์ `src/app/auth/signin/`
- สร้างไฟล์ `page.tsx` ภายในโฟลเดอร์นั้น
- นี่คือหน้า Login พื้นฐาน (จะใช้ Shadcn UI สร้าง Form ในอนาคต)

```tsx
// src/app/auth/signin/page.tsx
"use client"; // หน้านี้จะต้องเป็น Client Component เพื่อใช้ useSession, signIn function

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@southern-syntax/ui"; // ใช้ Shadcn UI Button
import { Input } from "@southern-syntax/ui/input"; // คุณอาจจะต้องเพิ่ม Input Component ของ Shadcn UI ก่อน: pnpm dlx shadcn@latest add input

export default function SignInPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    const result = await signIn("credentials", {
      redirect: false, // ไม่ให้ NextAuth redirect อัตโนมัติ เราจะจัดการเอง
      email,
      password,
    });

    if (result?.error) {
      setError(result.error);
    } else {
      // Login สำเร็จ, redirect ไปหน้า Dashboard หรือหน้าหลัก
      window.location.href = "/"; // หรือใช้ useRouter().push('/')
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">เข้าสู่ระบบ</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              อีเมล
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              รหัสผ่าน
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full">
            เข้าสู่ระบบ
          </Button>
        </form>
      </div>
    </div>
  );
}
```

### 2.1.7 การสร้าง Logic สำหรับ Hash Password และ Verify Password

เนื่องจาก Credentials Provider ต้องการ Logic การ Hash รหัสผ่าน (ตอนสร้าง User) และการ Verify รหัสผ่าน (ตอน Login) เราจะใช้ไลบรารี `bcryptjs`

#### 2.1.7.1 ติดตั้ง `bcryptjs`

```bash
pnpm add bcryptjs @types/bcryptjs -D
```

#### 2.1.7.2 สร้างไฟล์ `src/lib/auth-utils.ts`

- สร้างไฟล์ใหม่ชื่อ `auth-utils.ts` ภายในโฟลเดอร์ `src/lib/`
- เพิ่มโค้ดสำหรับ Hash และ Verify Password:

```ts
// src/lib/auth/utils.ts
// ไฟล์นี้รวม utilities สำหรับ Authentication (Password Hashing)
// และ Authorization (RBAC Permission Checker)

import bcrypt from "bcryptjs";
import prisma from "../prisma"; // Import Prisma Client (อยู่ที่ src/lib/prisma.ts)
import type { Session } from "next-auth";
import { PermissionActionType, PermissionResourceType } from "./constants"; // Import Types จาก constants

// --- Authentication Utilities ---

const SALT_ROUNDS = 10; // จำนวนรอบในการ salt (แนะนำ 10-12)

/**
 * Hashes a plain password.
 * @param password The plain text password.
 * @returns The hashed password string.
 */
export async function hashPassword(password: string): Promise<string> {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  return hashedPassword;
}

/**
 * Verifies a plain password against a hashed password.
 * @param plainPassword The plain text password from the user.
 * @param hashedPassword The hashed password stored in the database.
 * @returns True if passwords match, false otherwise.
 */
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
  return isMatch;
}

// --- Authorization Utilities (RBAC Permission Checker) ---

interface UserPermissions {
  [resource: string]: {
    [action: string]: boolean;
  };
}

/**
 * Fetches and structures permissions for a given user from the database.
 * This function is designed to run on the server side.
 * @param userId The ID of the user.
 * @returns An object representing the user's permissions, structured by resource and action.
 */
export async function getUserPermissions(
  userId: string
): Promise<UserPermissions> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true, // ดึงข้อมูล permission object
            },
          },
        },
      },
    },
  });

  if (!user || !user.role) {
    return {}; // ไม่มีผู้ใช้ หรือผู้ใช้ไม่มีบทบาท ก็ไม่มีสิทธิ์
  }

  const permissions: UserPermissions = {};
  user.role.permissions.forEach((rp) => {
    // ให้แน่ใจว่า resource และ action เป็น Type ที่ถูกต้องจาก Permission Model
    const resource = rp.permission.resource as PermissionResourceType;
    const action = rp.permission.action as PermissionActionType;

    if (!permissions[resource]) {
      permissions[resource] = {};
    }
    permissions[resource][action] = true;
  });

  return permissions;
}

/**
 * Checks if a user has a specific permission based on their session.
 * This function is designed to run on the server side.
 * @param session The NextAuth.js session object.
 * @param resource The resource to check (e.g., "PRODUCT", "USER"). Use constants from src/lib/auth/constants.ts.
 * @param action The action to check (e.g., "CREATE", "READ", "UPDATE", "DELETE"). Use constants from src/lib/auth/constants.ts.
 * @returns True if the user has the permission, false otherwise.
 */
export async function can(
  session: Session | null | undefined,
  resource: PermissionResourceType, // ใช้ Type ที่กำหนด
  action: PermissionActionType // ใช้ Type ที่กำหนด
): Promise<boolean> {
  if (!session || !session.user?.id) {
    return false; // ไม่ได้ Login
  }

  // ในอนาคต: สามารถเพิ่ม Caching Mechanism ที่นี่เพื่อลด Database calls
  const userPermissions = await getUserPermissions(session.user.id);

  // ตรวจสอบอย่างปลอดภัยว่ามี resource และ action นั้นอยู่
  return !!(userPermissions[resource] && userPermissions[resource][action]);
}
```

#### 2.1.7.3 ปรับปรุง `src/lib/option.ts` (Credentials Provider Logic)

- นำเข้า `hashPassword` และ `verifyPassword`
- ใช้ `verifyPassword` ใน `authorize` callback

```ts
// src/lib/auth/options.ts (ส่วนที่แก้ไข)
import { hashPassword, verifyPassword } from "./utils"; // <-- แก้ไขจาก './auth-utils' เป็น './utils'

// ... (โค้ดเดิม)

export const authOptions: NextAuthOptions = {
  // ... (โค้ดเดิม)
  providers: [
    CredentialsProvider({
      // ... (โค้ดเดิม)
      async authorize(credentials) {
        // ... (โค้ดเดิม)
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) {
          throw new Error("Invalid credentials"); // หรือ return null;
        }

        const passwordMatches = await verifyPassword(
          credentials.password,
          user.passwordHash
        );

        if (!passwordMatches) {
          throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง"); // Changed to throw Error for specific message
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  // ... (โค้ดเดิม)
};
```

## 2.2 การพัฒนาระบบจัดการสิทธิ์ (Authorization - RBAC)

ตอนนี้เราจะพัฒนาระบบ Role-Based Access Control (RBAC) เพื่อกำหนดและตรวจสอบสิทธิ์ของผู้ใช้งาน

### 2.2.1 การขยาย Schema สำหรับ RBAC

เราจะเพิ่ม Models `Role` และ `Permission` รวมถึงตารางเชื่อมโยง `RolePermission` เข้าไปใน `prisma/schema.prisma`

#### 2.2.1.1 แก้ไขไฟล์ `prisma/schema.prisma`

- เปิดไฟล์ `prisma/schema.prisma`
- เพิ่ม Models ดังกล่าว:

```prisma
// prisma/schema.prisma (ส่วนที่แก้ไข)

// ... (โค้ดเดิม Models User, Account, Session, VerificationToken)

// --- Models สำหรับ Role-Based Access Control (RBAC) ---
model Role {
  id          String         @id @default(cuid()) // Unique ID for the role
  key         String         @unique // Technical identifier, e.g., "admin", "editor", "viewer"
  name        String         // Display name, can be translated. Not unique to allow dynamic updates.
  description String?        @db.Text // Optional: Description of the role (can be long)
  isSystem    Boolean        @default(false) // True if this is a system-defined role (should not be deleted/edited via UI)
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  users       User[]
  permissions RolePermission[]

  @@index([name])
  @@index([key])
}

model Permission {
  id          String         @id @default(cuid()) // Unique ID for the permission
  key         String         @unique // Technical identifier, e.g., "product:create", "user:read"
  action      String         // Action part of permission (e.g., "CREATE", "READ", "UPDATE", "DELETE"). String for dynamic management.
  resource    String         // Resource part of permission (e.g., "PRODUCT", "POST", "USER"). String for dynamic management.
  description String?        @db.Text // Optional: Description of the permission (can be long)
  isSystem    Boolean        @default(false) // True if this is a system-defined permission
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  roles       RolePermission[]

  @@unique([action, resource])
  @@index([action])
  @@index([resource])
  @@index([key])
}

model RolePermission {
  id           String     @id @default(cuid())
  roleId       String
  permissionId String
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@unique([roleId, permissionId])
}
```

### 2.2.2 รัน Migration ใหม่สำหรับ RBAC Schema

เมื่อเราแก้ไข `schema.prisma` แล้ว เราจะต้องรัน Migration เพื่อปรับใช้การเปลี่ยนแปลงนี้กับฐานข้อมูล

#### 2.2.2.1 รันคำสั่ง Prisma Migrate Dev

- ใน Terminal ที่โฟลเดอร์โปรเจกต์ของคุณ:

```bash
pnpm prisma migrate dev --name add-rbac-models
```

- **คำอธิบาย:**
  - คำสั่งนี้จะสร้าง Migration ใหม่ที่บันทึกการเพิ่มตาราง `Role`, `Permission`, `RolePermission` และการเปลี่ยนแปลงใน `User` Model
  - Prisma จะปรับใช้การเปลี่ยนแปลงเหล่านี้กับ Supabase Database ของคุณ
  - Prisma Client จะถูก Generate ใหม่โดยอัตโนมัติ

### 2.2.3 การสร้าง Service สำหรับ RBAC (Permission Checker)

เราจะสร้าง Utility function ที่สามารถใช้ตรวจสอบสิทธิ์ของผู้ใช้งานได้ในฝั่ง Server

#### 2.2.3.1 สร้างไฟล์ `src/lib/auth/utils.ts` (รวม `authz-utils.ts` เดิม)

- เพิ่มโค้ดสำหรับ `getUserPermissions` และ `can` function ในไฟล์ `src/lib/auth/utils.ts`

```ts
// src/lib/auth/utils.ts (ส่วนที่แก้ไขและรวม)
import bcrypt from "bcryptjs";
import prisma from "../prisma";
import type { Session } from "next-auth";
import { PermissionActionType, PermissionResourceType } from "./constants";

// --- Authentication Utilities (เหมือนเดิม) ---
const SALT_ROUNDS = 10;
export async function hashPassword(password: string): Promise<string> {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  return hashedPassword;
}
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
  return isMatch;
}

// --- Authorization Utilities (RBAC Permission Checker) ---

interface UserPermissions {
  [resource: string]: {
    [action: string]: boolean;
  };
}

/**
 * Fetches and structures permissions for a given user from the database.
 * This function is designed to run on the server side.
 * @param userId The ID of the user.
 * @returns An object representing the user's permissions, structured by resource and action.
 */
export async function getUserPermissions(
  userId: string
): Promise<UserPermissions> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  if (!user || !user.role) {
    return {};
  }

  const permissions: UserPermissions = {};
  user.role.permissions.forEach((rp) => {
    const resource = rp.permission.resource as PermissionResourceType;
    const action = rp.permission.action as PermissionActionType;

    if (!permissions[resource]) {
      permissions[resource] = {};
    }
    permissions[resource][action] = true;
  });

  return permissions;
}

/**
 * Checks if a user has a specific permission based on their session.
 * This function is designed to run on the server side.
 * @param session The NextAuth.js session object.
 * @param resource The resource to check (e.g., "PRODUCT", "USER"). Use constants from src/lib/auth/constants.ts.
 * @param action The action to check (e.g., "CREATE", "READ", "UPDATE", "DELETE"). Use constants from src/lib/auth/constants.ts.
 * @returns True if the user has the permission, false otherwise.
 */
export async function can(
  session: Session | null | undefined,
  resource: PermissionResourceType, // ใช้ Type ที่กำหนด
  action: PermissionActionType // ใช้ Type ที่กำหนด
): Promise<boolean> {
  if (!session || !session.user?.id) {
    return false;
  }

  // ในอนาคต: สามารถเพิ่ม Caching Mechanism ที่นี่เพื่อลด Database calls
  const userPermissions = await getUserPermissions(session.user.id);

  return !!(userPermissions[resource] && userPermissions[resource][action]);
}
```

### 2.2.4 การป้องกัน Admin Routes และ API Routes เบื้องต้น

เราจะใช้ `getServerSession` ของ NextAuth.js และ `can` utility เพื่อป้องกัน Route หรือ API Route ที่ควรจำกัดเฉพาะผู้ดูแลระบบ

#### 2.2.4.1 ป้องกันหน้า Admin Dashboard (ตัวอย่าง)

- แก้ไขไฟล์ `src/app/admin/dashboard/page.tsx` (หรือสร้างขึ้นมาใหม่เพื่อทดสอบ)
- ใช้ `getServerSession` เพื่อตรวจสอบ Session และ `can` เพื่อตรวจสอบสิทธิ์

```tsx
// src/app/admin/dashboard/page.tsx (หรือหน้า Admin อื่นๆ)
import { getServerSession } from "next-auth";
import { authOptions, can } from "@/lib/auth"; // Import authOptions และ can
import { PERMISSION_RESOURCES, PERMISSION_ACTIONS } from "@/lib/auth/constants"; // Import constants
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  // ตรวจสอบสิทธิ์: ผู้ใช้ต้องมีสิทธิ์ 'READ' บนทรัพยากร 'ADMIN_DASHBOARD'
  const hasPermission = await can(
    session,
    PERMISSION_RESOURCES.ADMIN_DASHBOARD, // ใช้ค่าจาก constants
    PERMISSION_ACTIONS.READ // ใช้ค่าจาก constants
  );

  if (!hasPermission) {
    redirect("/");
  }

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Admin Dashboard</h1>
      <p>ยินดีต้อนรับ, {session.user?.name || session.user?.email}!</p>
      <p>คุณมีสิทธิ์เข้าถึงส่วนผู้ดูแลระบบ</p>
    </div>
  );
}
```

#### 2.2.4.2 ป้องกัน API Route (ตัวอย่าง: การสร้าง User)

- สร้างไฟล์ `src/app/api/admin/users/route.ts` (หรือ API Route สำหรับ User Management)
- ใช้ `getServerSession` และ `can` เพื่อตรวจสอบสิทธิ์ก่อนดำเนินการ

```ts
// src/app/api/admin/users/route.ts (ตัวอย่าง)
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, can, hashPassword } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PERMISSION_RESOURCES, PERMISSION_ACTIONS } from "@/lib/auth/constants"; // Import constants

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // ตรวจสอบสิทธิ์: ผู้ใช้ต้องมีสิทธิ์ "CREATE" บนทรัพยากร "USER"
  const hasPermission = await can(
    session,
    PERMISSION_RESOURCES.USER, // ใช้ค่าจาก constants
    PERMISSION_ACTIONS.CREATE // ใช้ค่าจาก constants
  );
  if (!hasPermission) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { email, name, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: hashedPassword,
        // roleId: ถ้าต้องการกำหนด role ตั้งแต่สร้าง
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { message: "Error creating user" },
      { status: 500 }
    );
  }
}
```
