import { describe, it, expect } from "vitest";

import {
  ROLE_NAMES,
  getDefaultPermissionsForRole,
  PERMISSION_RESOURCES,
  isSuperAdminOnlyResource,
  listAllPermissions,
  ALL_PERMISSION_KEYS,
  ensureActionAllowed,
  PERMISSION_ACTIONS,
} from "../index";

describe("RBAC configuration", () => {
  it("provides default permissions for admin", () => {
    const permissions = getDefaultPermissionsForRole(ROLE_NAMES.ADMIN);
    expect(permissions).toContain(
      `${PERMISSION_RESOURCES.USER}:${PERMISSION_ACTIONS.CREATE}`
    );
  });

  it("marks super admin only resources", () => {
    expect(isSuperAdminOnlyResource(PERMISSION_RESOURCES.ROLE)).toBe(true);
    expect(isSuperAdminOnlyResource(PERMISSION_RESOURCES.POST)).toBe(false);
  });

  it("lists every permission descriptor", () => {
    const descriptors = listAllPermissions();
    expect(descriptors).toHaveLength(ALL_PERMISSION_KEYS.length);
  });

  it("guards against unsupported action/resource combinations", () => {
    expect(() =>
      ensureActionAllowed(
        PERMISSION_RESOURCES.ROLE,
        PERMISSION_ACTIONS.ASSIGN
      )
    ).toThrow();
  });
});
