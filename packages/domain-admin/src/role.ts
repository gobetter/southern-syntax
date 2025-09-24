import { type Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { prisma } from "@southern-syntax/db";
import type { RoleInput } from "@southern-syntax/auth";
import { invalidatePermissionsByRole } from "@southern-syntax/auth/utils";
import {
  ROLE_NAMES,
  DEFAULT_FALLBACK_ROLE,
  isSuperAdminOnlyResource,
  ensureActionAllowed,
  type PermissionResourceType,
  type PermissionActionType,
  type RoleNameType,
} from "@southern-syntax/rbac";

import { AUDIT_ACTIONS } from "@southern-syntax/constants/audit-actions";

import { auditLogService } from "./audit-log";

type PermissionRecord = {
  id: string;
  resource: string;
  action: string;
};

async function validateAssignedPermissions(
  permissionIds: string[],
  actorIsSuperAdmin: boolean
): Promise<PermissionRecord[]> {
  if (permissionIds.length === 0) {
    return [];
  }

  const uniquePermissionIds = Array.from(new Set(permissionIds));
  const permissions = await prisma.permission.findMany({
    where: { id: { in: uniquePermissionIds } },
    select: { id: true, resource: true, action: true },
  });

  if (permissions.length !== uniquePermissionIds.length) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "INVALID_PERMISSION_SELECTION",
    });
  }

  for (const permission of permissions) {
    const resource = permission.resource as PermissionResourceType;
    const action = permission.action as PermissionActionType;
    ensureActionAllowed(resource, action);

    if (!actorIsSuperAdmin && isSuperAdminOnlyResource(resource)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "PERMISSION_NOT_ALLOWED",
      });
    }
  }

  return permissions;
}

async function getAllRoles() {
  return prisma.role.findMany({
    orderBy: { createdAt: "asc" },
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
      createdAt: "asc",
    },
  });
}

async function createRole(
  input: RoleInput & { permissionIds: string[] },
  actorId: string
) {
  const { name, key, description, isSystem, permissionIds } = input;
  const nameEnNormalized = name.en?.trim().toLowerCase();

  const existingKey = await prisma.role.findUnique({ where: { key } });
  if (existingKey) {
    throw new TRPCError({ code: "CONFLICT", message: "ROLE_KEY_EXISTS" });
  }

  const actor = await prisma.user.findUnique({
    where: { id: actorId },
    include: { role: true },
  });

  if (!actor) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const actorRoleKey = actor.role?.key as RoleNameType | undefined;
  const actorIsSuperAdmin = actorRoleKey === ROLE_NAMES.SUPERADMIN;

  if (isSystem && !actorIsSuperAdmin) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "CANNOT_CREATE_SYSTEM_ROLE",
    });
  }

  if (nameEnNormalized) {
    const existingName = await prisma.role.findUnique({
      where: { nameEnNormalized },
    });
    if (existingName) {
      throw new TRPCError({ code: "CONFLICT", message: "NAME_ALREADY_EXISTS" });
    }
  }
  const validatedPermissions = await validateAssignedPermissions(
    permissionIds,
    actorIsSuperAdmin
  );

  const permissionIdsToAssign = validatedPermissions.map((p) => p.id);

  const roleData: Prisma.RoleCreateInput = {
    key,
    name: name as Prisma.JsonObject,
    description: description ?? null,
    isSystem,
    nameEnNormalized: nameEnNormalized || "", // ต้องมีค่าเสมอ
    permissions: {
      create: permissionIdsToAssign.map((permissionId) => ({
        permission: { connect: { id: permissionId } },
      })),
    },
  };
  const newRole = await prisma.role.create({
    data: roleData,
  });

  await auditLogService.createLog({
    actorId,
    action: AUDIT_ACTIONS.ROLE_CREATED,
    entityType: "ROLE",
    entityId: newRole.id,
    details: { newData: { ...newRole, permissionIds } },
  });

  return newRole;
}

async function updateRole(
  id: string,
  input: RoleInput & { permissionIds: string[] },
  actorId: string
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
    throw new TRPCError({ code: "NOT_FOUND", message: "Role not found" });
  }

  if (!actor) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const actorRoleKey = actor?.role?.key as RoleNameType | undefined;
  const actorIsSuperAdmin = actorRoleKey === ROLE_NAMES.SUPERADMIN;

  if (oldData.isSystem && !actorIsSuperAdmin) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "CANNOT_EDIT_SYSTEM_ROLE",
    });
  }

  if (nameEnNormalized) {
    const existingName = await prisma.role.findFirst({
      where: { nameEnNormalized, id: { not: id } },
    });
    if (existingName) {
      throw new TRPCError({ code: "CONFLICT", message: "NAME_ALREADY_EXISTS" });
    }
  }

  const validatedPermissions = await validateAssignedPermissions(
    permissionIds,
    actorIsSuperAdmin
  );

  const permissionIdsToAssign = validatedPermissions.map((p) => p.id);

  const updateData: Prisma.RoleUpdateInput = {
    key,
    name: name as Prisma.JsonObject,
    permissions: {
      deleteMany: {},
      create: permissionIdsToAssign.map((permissionId) => ({
        permission: { connect: { id: permissionId } },
      })),
    },
  };
  if (description !== undefined) {
    updateData.description = description ?? null;
  }
  if (nameEnNormalized !== undefined) {
    updateData.nameEnNormalized = nameEnNormalized;
  }

  const updatedRole = await prisma.role.update({
    where: { id },
    data: updateData,
  });

  await auditLogService.createLog({
    actorId,
    action: AUDIT_ACTIONS.ROLE_UPDATED,
    entityType: "ROLE",
    entityId: updatedRole.id,
    details: {
      oldData: {
        ...oldData,
        permissionIds: oldData.permissions.map((p) => p.permissionId),
      },
      newData: { ...updatedRole, permissionIds },
    },
  });

  await invalidatePermissionsByRole(id);

  return updatedRole;
}

async function deleteRole(
  id: string,
  actorId: string,
  options?: { fallbackRoleId?: string }
) {
  const oldData = await prisma.role.findUnique({ where: { id } });
  if (!oldData) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Role not found" });
  }

  const actor = await prisma.user.findUnique({
    where: { id: actorId },
    include: { role: true },
  });

  if (!actor) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const actorRoleKey = actor.role?.key as RoleNameType | undefined;
  const actorIsSuperAdmin = actorRoleKey === ROLE_NAMES.SUPERADMIN;

  if (oldData.isSystem && !actorIsSuperAdmin) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "CANNOT_DELETE_SYSTEM_ROLE",
    });
  }

  const usersForRole = await prisma.user.findMany({
    where: { roleId: id },
    select: { id: true, email: true },
  });

  let fallbackRoleRecord: { id: string; key: string } | null = null;
  let reassignedUserIds: string[] = [];

  if (usersForRole.length > 0) {
    if (options?.fallbackRoleId) {
      fallbackRoleRecord = await prisma.role.findUnique({
        where: { id: options.fallbackRoleId },
        select: { id: true, key: true },
      });
    } else {
      fallbackRoleRecord = await prisma.role.findUnique({
        where: { key: DEFAULT_FALLBACK_ROLE },
        select: { id: true, key: true },
      });
    }

    if (!fallbackRoleRecord) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "ROLE_FALLBACK_NOT_FOUND",
      });
    }

    if (fallbackRoleRecord.id === id) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "ROLE_FALLBACK_INVALID",
      });
    }

    const fallbackRoleKey = fallbackRoleRecord.key as RoleNameType;
    if (
      fallbackRoleKey === ROLE_NAMES.SUPERADMIN &&
      !actorIsSuperAdmin
    ) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "PERMISSION_NOT_ALLOWED",
      });
    }

    await prisma.user.updateMany({
      where: { id: { in: usersForRole.map((user) => user.id) } },
      data: { roleId: fallbackRoleRecord.id },
    });

    reassignedUserIds = usersForRole.map((user) => user.id);

    await invalidatePermissionsByRole(fallbackRoleRecord.id);
  }

  const deletedRole = await prisma.role.delete({ where: { id } });

  await auditLogService.createLog({
    actorId,
    action: AUDIT_ACTIONS.ROLE_DELETED,
    entityType: "ROLE",
    entityId: id,
    details: {
      oldData,
      fallbackRoleId: fallbackRoleRecord?.id ?? null,
      reassignedUserIds,
    },
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
