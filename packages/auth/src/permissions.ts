import type { Session } from "next-auth";
import {
  ROLE_NAMES,
  type PermissionResourceType,
  type PermissionActionType,
} from "./constants";

/**
 * Checks if a user has a specific permission based on their session.
 * This function is safe to use in both server and client environments.
 */
export function can(
  session: Session | null | undefined,
  resource: PermissionResourceType,
  action: PermissionActionType
): boolean {
  if (!session?.user) {
    return false;
  }

  // If the user is SUPERADMIN, allow all actions
  if (session.user.role === ROLE_NAMES.SUPERADMIN) {
    return true;
  }

  if (!session.user.permissions) {
    return false;
  }

  return !!session.user.permissions[resource]?.[action];
}
