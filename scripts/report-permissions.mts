#!/usr/bin/env tsx
import { listAllPermissions, ROLE_DEFINITIONS, ROLE_NAMES, getDefaultPermissionsForRole, sortPermissionActions } from "@southern-syntax/rbac";

function printPermissions() {
  console.log("Permissions\n===========\n");
  const descriptors = listAllPermissions();
  descriptors.forEach(({ resource, action, superAdminOnly }) => {
    console.log(`${resource}:${action}${superAdminOnly ? " (super-admin only)" : ""}`);
  });
}

function printRoles() {
  console.log("\nRoles\n====\n");
  Object.entries(ROLE_DEFINITIONS).forEach(([roleKey, definition]) => {
    const permissions = getDefaultPermissionsForRole(roleKey as keyof typeof ROLE_NAMES);
    const sorted = sortPermissionActions(
      permissions.map((permission) => permission.split(":")[1] as never)
    );
    console.log(`- ${roleKey} (${definition.isSystem ? "system" : "custom"})`);
    console.log(`  Display name: ${definition.displayName.en}`);
    if (definition.descriptionKey) {
      console.log(`  Description key: ${definition.descriptionKey}`);
    }
    console.log(`  Permissions: ${permissions.length > 0 ? permissions.join(", ") : "(none)"}`);
    console.log(`  Unique actions: ${sorted.join(", ")}`);
  });
}

printPermissions();
printRoles();
