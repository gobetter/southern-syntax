// packages/auth/next-auth.d.ts
import "next-auth";
import type { LocalizedString } from "./i18n";

// สร้าง Type สำหรับ Permissions ที่จะเก็บใน session
// โดยใช้ key เป็นชื่อ resource และ value เป็น object ของ action
export type UserPermissions = {
  [resource: string]: {
    [action: string]: boolean;
  };
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      // name: string | null;
      name: string | LocalizedString | null;
      email: string | null;
      role: string; // "SUPERADMIN", "ADMIN", etc.
      permissions: UserPermissions;
    } & DefaultSession["user"];
  }

  interface User {
    name?: string | LocalizedString | null;
    role?: { key: string } | null; // ระบุว่า role object ต้องมี key
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    name?: string | LocalizedString | null;
    email?: string | null;
    role: string;
    permissions: UserPermissions;
  }
}
