#!/usr/bin/env tsx
import assert from "node:assert";

import {
  PERMISSION_RESOURCE_DEFINITIONS,
  ROLE_DEFINITIONS,
  type RoleNameType,
  type PermissionResourceType,
  listAllPermissions,
} from "@southern-syntax/rbac";
import en from "../packages/i18n/src/messages/common/en.json" assert { type: "json" };
import th from "../packages/i18n/src/messages/common/th.json" assert { type: "json" };

function ensureTranslations(resourceKey: PermissionResourceType, labelKey?: string, descriptionKey?: string) {
  if (!labelKey || !descriptionKey) {
    throw new Error(`Resource '${resourceKey}' is missing labelKey/descriptionKey`);
  }

  const labelSegments = labelKey.split(".");
  const descriptionSegments = descriptionKey.split(".");

  const enLabel = labelSegments.reduce((acc: any, segment) => acc?.[segment], en as any);
  const thLabel = labelSegments.reduce((acc: any, segment) => acc?.[segment], th as any);
  const enDescription = descriptionSegments.reduce((acc: any, segment) => acc?.[segment], en as any);
  const thDescription = descriptionSegments.reduce((acc: any, segment) => acc?.[segment], th as any);

  if (!enLabel || !thLabel || !enDescription || !thDescription) {
    throw new Error(`Missing translation for '${resourceKey}' (keys: ${labelKey}, ${descriptionKey})`);
  }
}

function validateResources() {
  Object.entries(PERMISSION_RESOURCE_DEFINITIONS).forEach(([resourceKey, definition]) => {
    ensureTranslations(resourceKey as PermissionResourceType, definition.labelKey, definition.descriptionKey);
  });
}

function validateRoles() {
  const permissionSet = new Set(listAllPermissions().map(({ key }) => key));

  Object.entries(ROLE_DEFINITIONS).forEach(([roleName, definition]) => {
    const defaultPermissions = definition.defaultPermissions;

    if (defaultPermissions === "ALL") {
      return;
    }

    Object.entries(defaultPermissions).forEach(([resourceKey, actions]) => {
      if (!actions) {
        return;
      }

      if (actions === "ALL") {
        return;
      }

      actions.forEach((action) => {
        const permissionKey = `${resourceKey}:${action}`;
        if (!permissionSet.has(permissionKey)) {
          throw new Error(`Role '${roleName}' references unknown permission '${permissionKey}'`);
        }
      });
    });
  });
}

function run() {
  console.log("Verifying RBAC resources and translations...");
  validateResources();
  console.log("✔ Resource translations are present");

  console.log("Validating role defaults against known permissions...");
  validateRoles();
  console.log("✔ Role presets reference existing permissions");

  console.log("RBAC verification completed successfully.");
}

try {
  run();
} catch (error) {
  console.error("RBAC verification failed:\n", error);
  process.exitCode = 1;
}
