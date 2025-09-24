import { type Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { hashPassword } from "@southern-syntax/auth/server";
import {
  getUserPermissions,
  invalidateUserPermissions,
} from "@southern-syntax/auth/utils";
import {
  type UserCreateOutput,
  type UserUpdateOutput,
} from "@southern-syntax/schemas/user";
import type {
  UserSortableField,
  UserStatusFilter,
} from "@southern-syntax/types";
import { VALID_USER_STATUSES } from "@southern-syntax/types";
import {
  ROLE_NAMES,
  ELEVATED_ROLE_KEYS,
  type RoleNameType,
} from "@southern-syntax/rbac";
import { prisma } from "@southern-syntax/db";

import type { SortOrder } from "@southern-syntax/types";
import {
  AUDIT_ACTIONS,
  type AuditAction,
} from "@southern-syntax/constants/audit-actions";

import { auditLogService } from "./audit-log";

const elevatedRoleSet = new Set<RoleNameType>(ELEVATED_ROLE_KEYS);
const isElevatedRoleKey = (key?: string | null): key is RoleNameType =>
  Boolean(key && elevatedRoleSet.has(key as RoleNameType));

/**
 * ดึงผู้ใช้ทั้งหมดพร้อมการแบ่งหน้า, ค้นหา, และเรียงลำดับ
 */
async function getAllUsers(params: {
  page?: number | undefined;
  pageSize?: number | undefined;
  searchQuery?: string | undefined;
  status?: UserStatusFilter | undefined;
  sortBy?: UserSortableField | undefined;
  sortOrder?: SortOrder | undefined;
  roleId?: string | undefined;
}) {
  const {
    page = 1,
    pageSize = 10,
    searchQuery,
    sortBy,
    sortOrder,
    roleId,
  } = params;
  const skip = (page - 1) * pageSize;

  const where: Prisma.UserWhereInput = {};

  // สร้างเงื่อนไขสำหรับ status
  if (params.status && VALID_USER_STATUSES.includes(params.status)) {
    where.isActive = params.status === "active";
  }

  // เพิ่มเงื่อนไขการกรองด้วย roleId
  if (roleId) {
    where.roleId = roleId;
  }

  if (searchQuery) {
    where.OR = [{ email: { contains: searchQuery, mode: "insensitive" } }];
  }

  // สร้าง logic สำหรับ orderBy
  const orderBy: Prisma.UserOrderByWithRelationInput =
    sortBy === "name"
      ? { name: sortOrder ?? "asc" }
      : sortBy === "role"
        ? { role: { key: sortOrder ?? "asc" } } // เรียงตาม key ของ Role
        : sortBy
          ? { [sortBy]: sortOrder ?? "asc" }
          : { createdAt: "desc" };

  const [users, totalCount] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      take: pageSize,
      skip,
      orderBy,
      include: { role: true }, // ดึงข้อมูล Role มาด้วยเสมอ
    }),
    prisma.user.count({ where }),
  ]);

  return { data: users, totalCount };
}

/**
 * สร้างผู้ใช้ใหม่
 */
async function createUser(input: UserCreateOutput, actorId: string) {
  // --- ตรวจสอบสิทธิ์ ---
  const actorPermissions = await getUserPermissions(actorId);
  const targetRole = await prisma.role.findUnique({
    where: { id: input.roleId },
  });

  const isAssigningHighLevelRole = isElevatedRoleKey(targetRole?.key);

  if (
    isAssigningHighLevelRole &&
    !actorPermissions["ADMIN_ACCESS"]?.["ASSIGN"]
  ) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "INSUFFICIENT_PERMISSIONS_TO_ASSIGN_ROLE",
    });
  }

  // --- ตรวจสอบข้อมูล ---
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existingUser) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  // --- ดำเนินการ ---
  const passwordHash = await hashPassword(input.password);
  const dataForDatabase: Prisma.UserCreateInput = {
    name: input.name as Prisma.JsonObject,
    email: input.email,
    role: { connect: { id: input.roleId } },
    isActive: input.isActive,
    passwordHash,
  };
  const newUser = await prisma.user.create({ data: dataForDatabase });

  // --- บันทึก Log ---
  await auditLogService.createLog({
    actorId,
    action: AUDIT_ACTIONS.USER_CREATED,
    entityType: "USER",
    entityId: newUser.id,
    details: { newData: newUser },
  });

  invalidateUserPermissions(newUser.id);

  return newUser;
}

/**
 * อัปเดตข้อมูลผู้ใช้
 */
async function updateUser(
  id: string,
  input: UserUpdateOutput,
  actorId: string
) {
  const oldData = await prisma.user.findUnique({ where: { id } });
  const actor = await prisma.user.findUnique({
    where: { id: actorId },
    include: { role: true },
  });

  // --- ตรวจสอบสิทธิ์ ---
  // ป้องกันการปิดการใช้งานบัญชีตัวเอง
  if (id === actorId && input.isActive === false) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "CANNOT_DEACTIVATE_SELF",
    });
  }

  // ป้องกันการเปลี่ยน Role ของตัวเอง (ยกเว้น Super Admin)
  // ตรวจสอบก็ต่อเมื่อมีการ "พยายามจะเปลี่ยน" Role ของตัวเองจริงๆ
  if (
    id === actorId &&
    input.roleId &&
    input.roleId !== oldData?.roleId && // เช็คว่า roleId ใหม่ไม่ตรงกับของเก่า
    actor?.role?.key !== ROLE_NAMES.SUPERADMIN
  ) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "CANNOT_CHANGE_OWN_ROLE",
    });
  }

  // ตรวจสอบสิทธิ์ในการกำหนด Role ก็ต่อเมื่อมีการ "พยายามจะเปลี่ยน" Role เท่านั้น
  if (input.roleId && input.roleId !== oldData?.roleId) {
    const actorPermissions = await getUserPermissions(actorId);
    const targetRole = await prisma.role.findUnique({
      where: { id: input.roleId },
    });

    const isAssigningHighLevelRole = isElevatedRoleKey(targetRole?.key);

    if (
      isAssigningHighLevelRole &&
      !actorPermissions["ADMIN_ACCESS"]?.["ASSIGN"]
    ) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "INSUFFICIENT_PERMISSIONS_TO_ASSIGN_ROLE",
      });
    }
  }

  // --- ดำเนินการ ---
  const dataToUpdate: Prisma.UserUpdateInput = {};

  if (input.name) {
    dataToUpdate.name = input.name as Prisma.JsonObject;
  }
  if (input.email) {
    dataToUpdate.email = input.email;
  }
  if (input.roleId) {
    dataToUpdate.role = { connect: { id: input.roleId } };
  }
  if (typeof input.isActive === "boolean") {
    dataToUpdate.isActive = input.isActive;
  }
  if (input.password) {
    dataToUpdate.passwordHash = await hashPassword(input.password);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: dataToUpdate,
  });

  // --- บันทึก Log ---
  let action: AuditAction = AUDIT_ACTIONS.USER_UPDATED;
  if (oldData?.isActive === true && updatedUser.isActive === false) {
    action = AUDIT_ACTIONS.USER_DEACTIVATED;
  } else if (oldData?.isActive === false && updatedUser.isActive === true) {
    action = AUDIT_ACTIONS.USER_REACTIVATED;
  }
  await auditLogService.createLog({
    actorId,
    action,
    entityType: "USER",
    entityId: updatedUser.id,
    details: { oldData, newData: updatedUser },
  });

  invalidateUserPermissions(updatedUser.id);

  return updatedUser;
}

// Bulk Deactivate
async function deactivateManyUsers(ids: string[], actorId: string) {
  const filteredIds = ids.filter((id) => id !== actorId);
  if (filteredIds.length === 0) return { count: 0 };

  const oldData = await prisma.user.findMany({
    where: { id: { in: filteredIds } },
  });

  const { count } = await prisma.user.updateMany({
    where: { id: { in: filteredIds } },
    data: { isActive: false },
  });

  await auditLogService.createLog({
    actorId,
    action: AUDIT_ACTIONS.USERS_DEACTIVATED_BULK,
    entityType: "USER",
    entityId: `bulk-deactivate-${filteredIds.length}-items`,
    details: { deactivatedCount: count, deactivatedUsers: oldData },
  });

  filteredIds.forEach((id) => invalidateUserPermissions(id));

  return { count };
}

// ฟังก์ชันใหม่สำหรับเปิดใช้งานหลายรายการ
async function reactivateManyUsers(ids: string[], actorId: string) {
  // ไม่จำเป็นต้องกรอง actorId ออก เพราะ Admin สามารถเปิดใช้งานบัญชีตัวเองได้ (ถ้าเผลอไปปิด)
  const oldData = await prisma.user.findMany({
    where: { id: { in: ids } },
  });

  const { count } = await prisma.user.updateMany({
    where: {
      id: { in: ids },
    },
    data: {
      isActive: true, // ตั้งค่าให้ Active
    },
  });

  await auditLogService.createLog({
    actorId,
    action: AUDIT_ACTIONS.USERS_REACTIVATED_BULK,
    entityType: "USER",
    entityId: `bulk-reactivate-${ids.length}-items`,
    details: { reactivatedCount: count, reactivatedUsers: oldData },
  });

  ids.forEach((id) => invalidateUserPermissions(id));

  return { count };
}

async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

async function deleteUser(id: string) {
  return prisma.user.delete({ where: { id } });
}

// ฟังก์ชันใหม่สำหรับเปลี่ยน Role หลายรายการ
async function changeManyUsersRole(
  ids: string[],
  newRoleId: string,
  actorId: string
) {
  // ไม่จำเป็นต้องกรอง actorId ออก เพราะ Admin สามารถเปลี่ยน Role ตัวเองได้
  const oldData = await prisma.user.findMany({
    where: { id: { in: ids } },
    include: { role: true }, // ดึงข้อมูล Role เก่ามาด้วยเพื่อใช้ใน Log
  });

  const { count } = await prisma.user.updateMany({
    where: {
      id: { in: ids },
    },
    data: {
      roleId: newRoleId, // ตั้งค่า roleId ใหม่
    },
  });

  await auditLogService.createLog({
    actorId,
    action: AUDIT_ACTIONS.USERS_ROLE_CHANGED_BULK,
    entityType: "USER",
    entityId: `bulk-role-change-${ids.length}-items`,
    details: {
      changedCount: count,
      newRoleId: newRoleId,
      changedUsers: oldData.map((u) => ({
        id: u.id,
        email: u.email,
        oldRole: u.role?.key,
      })),
    },
  });

  ids.forEach((id) => invalidateUserPermissions(id));

  return { count };
}

export const userService = {
  getAllUsers,
  createUser,
  updateUser,
  getUserById,
  deleteUser,
  deactivateManyUsers,
  reactivateManyUsers,
  changeManyUsersRole,
};
