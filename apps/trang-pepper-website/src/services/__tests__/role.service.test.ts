import { describe, it, expect, beforeEach, vi } from "vitest";
import type { PrismaClient, User, Role } from "@prisma/client";
import { mockDeep, mockReset } from "vitest-mock-extended";
import { ROLE_NAMES } from "@southern-syntax/auth";
import { type RoleInput } from "@southern-syntax/auth";

// --- Type Definitions for Mocks ---
// สร้าง Type ที่สมบูรณ์สำหรับ Mock ของเรา
type RoleWithPermissions = Role & { permissions: { permissionId: string }[] };
type UserWithRole = User & { role: { key: string } | null };

// --- Mocking Setup ---
const prismaMock = mockDeep<PrismaClient>();

vi.mock("@/lib/prisma", () => ({ default: prismaMock }));
vi.mock("../auditLog"); //  ✅ Mock auditLog service

describe("Role Service", () => {
  // ✅ 2. ใช้ Dynamic import() เพื่อ import `roleService` และ `auditLogService`
  let roleService: typeof import("../role").roleService;
  let auditLogService: typeof import("../auditLog").auditLogService;

  beforeEach(async () => {
    mockReset(prismaMock);
    vi.clearAllMocks();
    // ✅ 3. ทำการ import จริงๆ ใน beforeEach
    roleService = (await import("../role")).roleService;
    auditLogService = (await import("../auditLog")).auditLogService;
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
