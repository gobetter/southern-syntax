import { z } from "zod";

export const ROLE_NAMES = {
  SUPERADMIN: "SUPERADMIN",
} as const;
export type RoleNameType = (typeof ROLE_NAMES)[keyof typeof ROLE_NAMES];

export const PERMISSION_ACTIONS = {
  CREATE: "CREATE",
  READ: "READ",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  ASSIGN: "ASSIGN",
} as const;
export type PermissionActionType =
  (typeof PERMISSION_ACTIONS)[keyof typeof PERMISSION_ACTIONS];

export const PERMISSION_RESOURCES = {
  ADMIN_DASHBOARD: "ADMIN_DASHBOARD",
  SETTINGS: "SETTINGS",
  AUDIT_LOG: "AUDIT_LOG",
  LANGUAGE: "LANGUAGE",
  USER: "USER",
  ROLE: "ROLE",
  ADMIN_ACCESS: "ADMIN_ACCESS",
  POST: "POST",
  POST_CATEGORY: "POST_CATEGORY",
  POST_TAG: "POST_TAG",
  PRODUCT: "PRODUCT",
  PRODUCT_CATEGORY: "PRODUCT_CATEGORY",
  PRODUCT_TAG: "PRODUCT_TAG",
  MEDIA: "MEDIA",
  MEDIA_TAXONOMY: "MEDIA_TAXONOMY",
} as const;
export type PermissionResourceType =
  (typeof PERMISSION_RESOURCES)[keyof typeof PERMISSION_RESOURCES];

const permissionActionValues = Object.values(PERMISSION_ACTIONS) as [
  PermissionActionType,
  ...PermissionActionType[],
];
const permissionResourceValues = Object.values(PERMISSION_RESOURCES) as [
  PermissionResourceType,
  ...PermissionResourceType[],
];

export const PermissionActionSchema = z.enum(permissionActionValues);
export const PermissionResourceSchema = z.enum(permissionResourceValues);

export function isPermissionAction(value: unknown): value is PermissionActionType {
  return typeof value === "string" && permissionActionValues.includes(value as PermissionActionType);
}

export function isPermissionResource(value: unknown): value is PermissionResourceType {
  return (
    typeof value === "string" &&
    permissionResourceValues.includes(value as PermissionResourceType)
  );
}
