import { mapToSelectOptions } from "./select-options";
import type { LocalizedString } from "@southern-syntax/types";

export interface RoleOption {
  id: string;
  label: string;
}

interface RoleLike {
  id: string;
  key: string;
  name: LocalizedString;
}

export function mapRoleOptions<T extends RoleLike>(
  roles: T[] | undefined,
  locale: string
): RoleOption[] {
  return mapToSelectOptions(
    roles,
    locale,
    (role) => role.name,
    (role) => role.key
  ) as RoleOption[];
}
