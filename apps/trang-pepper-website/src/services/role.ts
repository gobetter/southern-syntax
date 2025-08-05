// src/services/role.ts
import prisma from '@/lib/prisma';
import { type Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';

import type { RoleInput } from '@/lib/auth/schemas';
import { AUDIT_ACTIONS } from '@/constants/auditActions';

import { auditLogService } from './auditLog';
import { invalidatePermissionsByRole } from '@/lib/auth/utils';

async function getAllRoles() {
  return prisma.role.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
      _count: {
        select: { users: true, permissions: true },
      },
    },
  });
}

async function getRoleById(id: string) {
  return prisma.role.findUnique({
    where: { id },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  });
}

/**
 * ดึงข้อมูล Role เฉพาะที่จำเป็นสำหรับ UI selection (Dropdowns, Filters)
 */
async function getRolesForSelection() {
  return prisma.role.findMany({
    select: {
      id: true,
      key: true,
      name: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
}

async function createRole(input: RoleInput & { permissionIds: string[] }, actorId: string) {
  const { name, key, description, isSystem, permissionIds } = input;
  const nameEnNormalized = name.en?.trim().toLowerCase();

  const existingKey = await prisma.role.findUnique({ where: { key } });
  if (existingKey) {
    throw new TRPCError({ code: 'CONFLICT', message: 'ROLE_KEY_EXISTS' });
  }

  if (nameEnNormalized) {
    const existingName = await prisma.role.findUnique({ where: { nameEnNormalized } });
    if (existingName) {
      throw new TRPCError({ code: 'CONFLICT', message: 'NAME_ALREADY_EXISTS' });
    }
  }

  const newRole = await prisma.role.create({
    data: {
      key,
      name: name as Prisma.JsonObject,
      description,
      isSystem,
      nameEnNormalized: nameEnNormalized || '', // ต้องมีค่าเสมอ
      permissions: {
        create: permissionIds.map((permissionId) => ({
          permission: { connect: { id: permissionId } },
        })),
      },
    },
  });

  await auditLogService.createLog({
    actorId,
    action: AUDIT_ACTIONS.ROLE_CREATED,
    entityType: 'ROLE',
    entityId: newRole.id,
    details: { newData: { ...newRole, permissionIds } },
  });

  return newRole;
}

async function updateRole(
  id: string,
  input: RoleInput & { permissionIds: string[] },
  actorId: string,
) {
  const { name, key, description, permissionIds } = input;

  const nameEnNormalized = name.en?.trim().toLowerCase();

  const oldData = await prisma.role.findUnique({
    where: { id },
    include: { permissions: true },
  });

  const actor = await prisma.user.findUnique({
    where: { id: actorId },
    include: { role: true },
  });

  if (!oldData) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Role not found' });
  }

  // if (oldData.isSystem) {
  //   throw new TRPCError({ code: 'FORBIDDEN', message: 'CANNOT_EDIT_SYSTEM_ROLE' });
  // }
  if (oldData.isSystem && actor?.role?.key !== 'SUPERADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'CANNOT_EDIT_SYSTEM_ROLE' });
  }

  if (nameEnNormalized) {
    const existingName = await prisma.role.findFirst({
      where: { nameEnNormalized, id: { not: id } },
    });
    if (existingName) {
      throw new TRPCError({ code: 'CONFLICT', message: 'NAME_ALREADY_EXISTS' });
    }
  }

  const updatedRole = await prisma.role.update({
    where: { id },
    data: {
      key,
      name: name as Prisma.JsonObject,
      description,
      nameEnNormalized: nameEnNormalized,
      permissions: {
        // ลบ permission เก่าทั้งหมด แล้วสร้างใหม่
        deleteMany: {},
        create: permissionIds.map((permissionId) => ({
          permission: { connect: { id: permissionId } },
        })),
      },
    },
  });

  await auditLogService.createLog({
    actorId,
    action: AUDIT_ACTIONS.ROLE_UPDATED,
    entityType: 'ROLE',
    entityId: updatedRole.id,
    details: {
      oldData: { ...oldData, permissionIds: oldData.permissions.map((p) => p.permissionId) },
      newData: { ...updatedRole, permissionIds },
    },
  });

  await invalidatePermissionsByRole(id);

  return updatedRole;
}

async function deleteRole(id: string, actorId: string) {
  const oldData = await prisma.role.findUnique({ where: { id } });
  if (!oldData) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Role not found' });
  }
  if (oldData.isSystem) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'CANNOT_DELETE_SYSTEM_ROLE' });
  }

  // ตรวจสอบว่ามีผู้ใช้ผูกอยู่กับ Role นี้หรือไม่
  const userCount = await prisma.user.count({
    where: { roleId: id },
  });
  if (userCount > 0) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: 'ROLE_IN_USE',
    });
  }

  const deletedRole = await prisma.role.delete({ where: { id } });

  await auditLogService.createLog({
    actorId,
    action: AUDIT_ACTIONS.ROLE_DELETED,
    entityType: 'ROLE',
    entityId: id,
    details: { oldData },
  });

  await invalidatePermissionsByRole(id);

  return deletedRole;
}

export const roleService = {
  getAllRoles,
  getRolesForSelection,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
};
