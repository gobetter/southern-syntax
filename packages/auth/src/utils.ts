// ไฟล์นี้รวม utilities สำหรับ Authentication (Password Hashing)
// และ Authorization (RBAC Permission Checker) ที่ต้องทำงานบน server

import bcrypt from "bcryptjs";
import { prisma } from "@southern-syntax/db";
import type { PermissionActionType, PermissionResourceType } from "./constants";

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

// Simple in-memory cache for user permissions
interface CachedPermissions {
  permissions: UserPermissions;
  expiresAt: number;
}

const permissionsCache = new Map<string, CachedPermissions>();
const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes

// กำหนด Type สำหรับ RolePermission ที่มี Permission รวมอยู่ด้วย
// ใช้โครงสร้างแบบง่ายเพื่อหลีกเลี่ยงการอ้างอิง Prisma โดยตรงในการ build
type RolePermissionWithPermission = {
  permission: { resource: string; action: string };
};

/**
 * Fetches and structures permissions for a given user from the database.
 * This function is designed to run on the server side.
 * @param userId The ID of the user.
 * @returns An object representing the user's permissions, structured by resource and action.
 */
export async function getUserPermissions(
  userId: string
): Promise<UserPermissions> {
  const cached = permissionsCache.get(userId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.permissions;
  }

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
  user.role.permissions.forEach((rp: RolePermissionWithPermission) => {
    const resource = rp.permission.resource as PermissionResourceType;
    const action = rp.permission.action as PermissionActionType;

    if (!permissions[resource]) {
      permissions[resource] = {};
    }
    permissions[resource][action] = true;
  });

  permissionsCache.set(userId, {
    permissions,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return permissions;
}

export function invalidateUserPermissions(userId: string) {
  permissionsCache.delete(userId);
}

export async function invalidatePermissionsByRole(roleId: string) {
  const users = await prisma.user.findMany({
    where: { roleId },
    select: { id: true },
  });
  // users.forEach((u) => invalidateUserPermissions(u.id));
  users.forEach((u: { id: string }) => invalidateUserPermissions(u.id));
}
