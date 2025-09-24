#!/usr/bin/env tsx
import {
  listAllPermissions,
  ROLE_DEFINITIONS,
  ROLE_NAMES,
  getDefaultPermissionsForRole,
  sortPermissionActions,
} from "@southern-syntax/rbac";
import { listResourceKeys } from "./lib/rbac-validation.mts";

process.stdout.on("error", (error) => {
  if ((error as NodeJS.ErrnoException).code === "EPIPE") {
    process.exit(0);
  }
  throw error;
});

function printPermissions() {
  console.log("Permissions\n===========\n");
  const descriptors = listAllPermissions();
  const descriptorsByResource = new Map<string, typeof descriptors>();

  descriptors.forEach((descriptor) => {
    const current = descriptorsByResource.get(descriptor.resource) ?? [];
    current.push(descriptor);
    descriptorsByResource.set(descriptor.resource, current);
  });

  listResourceKeys().forEach((resource) => {
    const entries = descriptorsByResource.get(resource) ?? [];
    const ordering = new Map(
      sortPermissionActions(entries.map(({ action }) => action)).map(
        (action, index) => [action, index] as const
      )
    );

    entries.sort((a, b) => {
      const indexA = ordering.get(a.action) ?? Number.MAX_SAFE_INTEGER;
      const indexB = ordering.get(b.action) ?? Number.MAX_SAFE_INTEGER;
      return indexA - indexB;
    });

    entries.forEach(({ action, superAdminOnly }) => {
      console.log(`${resource}:${action}${superAdminOnly ? " (super-admin only)" : ""}`);
    });
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
