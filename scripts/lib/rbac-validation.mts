import {
  PERMISSION_RESOURCE_DEFINITIONS,
  ROLE_DEFINITIONS,
  listAllPermissions,
  type PermissionResourceType,
} from "@southern-syntax/rbac";

import en from "../../packages/i18n/src/messages/common/en.json" assert { type: "json" };
import th from "../../packages/i18n/src/messages/common/th.json" assert { type: "json" };

function getByPath(source: unknown, path: string) {
  return path.split(".").reduce<unknown>((value, segment) => {
    if (value && typeof value === "object" && segment in value) {
      return (value as Record<string, unknown>)[segment];
    }
    return undefined;
  }, source);
}

export function validateResourceTranslations() {
  Object.entries(PERMISSION_RESOURCE_DEFINITIONS).forEach(
    ([resource, definition]) => {
      if (!definition.labelKey || !definition.descriptionKey) {
        throw new Error(
          `Resource '${resource}' is missing labelKey/descriptionKey`
        );
      }

      const enLabel = getByPath(en, definition.labelKey);
      const thLabel = getByPath(th, definition.labelKey);
      const enDescription = getByPath(en, definition.descriptionKey);
      const thDescription = getByPath(th, definition.descriptionKey);

      if (!enLabel || !thLabel || !enDescription || !thDescription) {
        throw new Error(
          `Missing translation for '${resource}' (keys: ${definition.labelKey}, ${definition.descriptionKey})`
        );
      }
    }
  );
}

export function validateRolePresets() {
  const permissionSet = new Set(listAllPermissions().map(({ key }) => key));

  Object.entries(ROLE_DEFINITIONS).forEach(([role, definition]) => {
    if (definition.defaultPermissions === "ALL") {
      return;
    }

    Object.entries(definition.defaultPermissions).forEach(
      ([resource, actions]) => {
        if (!actions || actions === "ALL") {
          return;
        }

        actions.forEach((action) => {
          const key = `${resource}:${action}`;
          if (!permissionSet.has(key)) {
            throw new Error(
              `Role '${role}' references unknown permission '${key}'`
            );
          }
        });
      }
    );
  });
}

export function runRbacValidation() {
  validateResourceTranslations();
  validateRolePresets();
}

export function listResourceKeys(): PermissionResourceType[] {
  return Object.keys(
    PERMISSION_RESOURCE_DEFINITIONS
  ) as PermissionResourceType[];
}
