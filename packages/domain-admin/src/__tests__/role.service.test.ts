import { describe, it, expect, beforeEach, vi } from "vitest";
import type { PrismaClient, User, Role } from "@prisma/client";
import { mockDeep, mockReset } from "vitest-mock-extended";

import { ROLE_NAMES } from "@southern-syntax/rbac";
import type { RoleInput } from "@southern-syntax/auth";
import type { CreateLogParams } from "../audit-log";
import { invalidatePermissionsByRole as invalidatePermissionsByRoleMock } from "@southern-syntax/auth/utils";

type RoleWithPermissions = Role & { permissions: { permissionId: string }[] };
type UserWithRole = User & { role: { key: string } | null };

type RoleService = {
  updateRole: (
    roleId: string,
    input: RoleInput & { permissionIds: string[] },
    actorUserId: string
  ) => Promise<unknown>;
  deleteRole: (
    roleId: string,
    actorUserId: string,
    options?: { fallbackRoleId?: string }
  ) => Promise<unknown>;
};
type AuditLogService = {
  createLog: (params: CreateLogParams) => Promise<void>;
  [k: string]: unknown;
};

const prismaMock = mockDeep<PrismaClient>();

vi.mock("@southern-syntax/db", () => ({
  default: prismaMock,
  prisma: prismaMock,
}));
vi.mock("@southern-syntax/auth/utils", () => ({
  invalidatePermissionsByRole: vi.fn(),
}));
vi.mock("../audit-log"); //  ✅ Mock auditLog service

describe("Role Service", () => {
  let roleService: RoleService;
  let auditLogService: AuditLogService;
  const invalidatePermissionsSpy =
    invalidatePermissionsByRoleMock as unknown as ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    mockReset(prismaMock);
    vi.clearAllMocks();
    roleService = (await import("../role")).roleService;
    auditLogService = (await import("../audit-log")).auditLogService;
  });

  const superAdminActor = {
    id: "superadmin-user-id",
    role: { key: ROLE_NAMES.SUPERADMIN },
  };
  const adminActor: Partial<UserWithRole> = {
    id: "admin-user-id",
    role: { key: ROLE_NAMES.ADMIN },
  };

  const systemRole: RoleWithPermissions = {
    id: "admin-role-id",
    key: ROLE_NAMES.ADMIN,
    isSystem: true,
    permissions: [],
    name: { en: "Admin" },
    description: null,
    nameEnNormalized: "admin",
    isSelectableOnRegistration: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const customRole: RoleWithPermissions = {
    id: "custom-role-id",
    key: "CUSTOM",
    isSystem: false,
    permissions: [],
    name: { en: "Custom" },
    description: null,
    nameEnNormalized: "custom",
    isSelectableOnRegistration: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // --- Tests for updateRole ---
  describe("updateRole", () => {
    it("rejects when supplied permissions are missing", async () => {
      prismaMock.role.findUnique.mockResolvedValue(customRole as Role);
      prismaMock.user.findUnique.mockResolvedValue(superAdminActor as UserWithRole);
      prismaMock.permission.findMany.mockResolvedValue([]);

      const input: RoleInput & { permissionIds: string[] } = {
        key: "CUSTOM",
        name: { en: "Custom", th: "" },
        description: "",
        permissionIds: ["missing-perm"],
        isSystem: false,
      };

      await expect(
        roleService.updateRole(customRole.id, input, superAdminActor.id)
      ).rejects.toThrow("INVALID_PERMISSION_SELECTION");
    });

    it("forbids assigning super-admin only permissions to non super-admin", async () => {
      prismaMock.role.findUnique.mockResolvedValue(customRole as Role);
      prismaMock.user.findUnique.mockResolvedValue(adminActor as UserWithRole);
      prismaMock.permission.findMany.mockResolvedValue([
        {
          id: "perm-1",
          resource: "ADMIN_DASHBOARD",
          action: "READ",
        },
      ] as Array<{ id: string; resource: string; action: string }>);

      const input: RoleInput & { permissionIds: string[] } = {
        key: "CUSTOM",
        name: { en: "Custom", th: "" },
        description: "",
        permissionIds: ["perm-1"],
        isSystem: false,
      };

      await expect(
        roleService.updateRole(customRole.id, input, adminActor.id!)
      ).rejects.toThrow("PERMISSION_NOT_ALLOWED");
    });

    it("should allow Super Admin to update a system role", async () => {
      prismaMock.role.findUnique.mockResolvedValue(systemRole as Role);
      prismaMock.user.findUnique.mockResolvedValue(
        superAdminActor as UserWithRole
      );

      prismaMock.role.update.mockResolvedValue({
        ...systemRole,
        name: { en: "New Name" },
        permissions: [],
      } as Role);

      //    จำลองว่าเมื่อค้นหา user ที่อยู่ใน role นี้ จะได้ผลลัพธ์เป็น array ว่าง
      prismaMock.user.findMany.mockResolvedValue([]);

      const input: RoleInput & { permissionIds: string[] } = {
        key: ROLE_NAMES.ADMIN,
        name: { en: "New Name", th: "" },
        description: "",
        isSystem: true,
        permissionIds: [],
      };

      await expect(
        roleService.updateRole(systemRole.id!, input, superAdminActor.id)
      ).resolves.toBeDefined();

      expect(auditLogService.createLog).toHaveBeenCalled();
      expect(invalidatePermissionsSpy).toHaveBeenCalledWith(systemRole.id);
    });

    it("should FORBID an Admin from updating a system role", async () => {
      prismaMock.role.findUnique.mockResolvedValue(systemRole as Role);
      prismaMock.user.findUnique.mockResolvedValue(adminActor as UserWithRole);

      const input: RoleInput & { permissionIds: string[] } = {
        key: ROLE_NAMES.ADMIN,
        name: { en: "New Name", th: "" },
        description: "",
        isSystem: true,
        permissionIds: [],
      };

      await expect(
        roleService.updateRole(systemRole.id, input, adminActor.id!)
      ).rejects.toThrow("CANNOT_EDIT_SYSTEM_ROLE");
    });
  });

  // --- Tests for deleteRole ---
  describe("deleteRole", () => {
    it("should FORBID an Admin from deleting a system role", async () => {
      prismaMock.role.findUnique.mockResolvedValue(systemRole);
      prismaMock.user.findUnique.mockResolvedValue(
        adminActor as UserWithRole
      );
      prismaMock.user.findMany.mockResolvedValue([]);

      await expect(
        roleService.deleteRole(systemRole.id, adminActor.id!)
      ).rejects.toThrow("CANNOT_DELETE_SYSTEM_ROLE");
    });

    it("should block deletion when fallback is superadmin and actor is not", async () => {
      prismaMock.role.findUnique
        .mockResolvedValueOnce(customRole)
        .mockResolvedValueOnce({ id: "super-role", key: ROLE_NAMES.SUPERADMIN } as Role);

      prismaMock.user.findUnique.mockResolvedValue(adminActor as UserWithRole);
      prismaMock.user.findMany.mockResolvedValue([
        { id: "user-1", email: "user1@example.com" } as User,
      ]);

      await expect(
        roleService.deleteRole(customRole.id, adminActor.id!, {
          fallbackRoleId: "super-role",
        })
      ).rejects.toThrow("PERMISSION_NOT_ALLOWED");
    });

    it("reassigns users to fallback role before deletion", async () => {
      prismaMock.role.findUnique
        .mockResolvedValueOnce(customRole)
        .mockResolvedValueOnce({
          id: "viewer-role-id",
          key: ROLE_NAMES.VIEWER,
        } as Role);

      prismaMock.user.findUnique.mockResolvedValue(
        superAdminActor as UserWithRole
      );
      prismaMock.user.findMany.mockResolvedValue([
        { id: "user-1", email: "user1@example.com" } as User,
      ]);

      prismaMock.user.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.role.delete.mockResolvedValue(customRole as Role);

      await expect(
        roleService.deleteRole(customRole.id, superAdminActor.id!)
      ).resolves.toBeDefined();

      expect(prismaMock.user.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ["user-1"] } },
        data: { roleId: "viewer-role-id" },
      });
      expect(prismaMock.role.delete).toHaveBeenCalledWith({
        where: { id: customRole.id },
      });
      expect(invalidatePermissionsSpy).toHaveBeenCalledWith("viewer-role-id");
      expect(invalidatePermissionsSpy).toHaveBeenCalledWith(customRole.id);
    });
  });
});
