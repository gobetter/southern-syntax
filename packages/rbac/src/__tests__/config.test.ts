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
  getPermissionResourceDefinition,
  sortPermissionActions,
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

  it("exposes resource metadata", () => {
    const definition = getPermissionResourceDefinition(
      PERMISSION_RESOURCES.ADMIN_DASHBOARD
    );
    expect(definition.labelKey).toBeDefined();
    expect(definition.actions).toContain(PERMISSION_ACTIONS.READ);
  });

  it("sorts permission actions using the configured order", () => {
    const shuffled = [
      PERMISSION_ACTIONS.DELETE,
      PERMISSION_ACTIONS.CREATE,
      PERMISSION_ACTIONS.UPDATE,
      PERMISSION_ACTIONS.READ,
    ];
    const sorted = sortPermissionActions(shuffled);
    expect(sorted).toEqual([
      PERMISSION_ACTIONS.CREATE,
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.UPDATE,
      PERMISSION_ACTIONS.DELETE,
    ]);
  });
});
