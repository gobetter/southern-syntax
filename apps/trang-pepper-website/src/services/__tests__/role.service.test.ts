import { describe, it, expect, beforeEach, vi } from "vitest";
import type { PrismaClient, User, Role } from "@prisma/client";
import { mockDeep, mockReset } from "vitest-mock-extended";

import { ROLE_NAMES, type RoleInput } from "@southern-syntax/auth";
import type { CreateLogParams } from "../audit-log";

type RoleWithPermissions = Role & { permissions: { permissionId: string }[] };
type UserWithRole = User & { role: { key: string } | null };

type RoleService = {
  updateRole: (
    roleId: string,
    input: RoleInput & { permissionIds: string[] },
    actorUserId: string
  ) => Promise<unknown>;
  deleteRole: (roleId: string, actorUserId: string) => Promise<unknown>;
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
vi.mock("@/lib/prisma", () => ({ default: prismaMock }));
vi.mock("../audit-log"); //  ✅ Mock auditLog service

describe("Role Service", () => {
  let roleService: RoleService;
  let auditLogService: AuditLogService;

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
    role: { key: "ADMIN" },
  };

  const systemRole: RoleWithPermissions = {
    id: "admin-role-id",
    key: "ADMIN",
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
        key: "ADMIN",
        name: { en: "New Name", th: "" },
        description: "",
        isSystem: true,
        permissionIds: [],
      };

      await expect(
        roleService.updateRole(systemRole.id!, input, superAdminActor.id)
      ).resolves.toBeDefined();

      expect(auditLogService.createLog).toHaveBeenCalled();
    });

    it("should FORBID an Admin from updating a system role", async () => {
      prismaMock.role.findUnique.mockResolvedValue(systemRole as Role);
      prismaMock.user.findUnique.mockResolvedValue(adminActor as UserWithRole);

      const input: RoleInput & { permissionIds: string[] } = {
        key: "ADMIN",
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

      await expect(
        roleService.deleteRole(systemRole.id, adminActor.id!)
      ).rejects.toThrow("CANNOT_DELETE_SYSTEM_ROLE");
    });

    it("should prevent deletion of a role with assigned users", async () => {
      prismaMock.role.findUnique.mockResolvedValue(customRole);
      prismaMock.user.count.mockResolvedValue(1);

      await expect(
        roleService.deleteRole(customRole.id, superAdminActor.id!)
      ).rejects.toThrow("ROLE_IN_USE");
    });
  });
});
