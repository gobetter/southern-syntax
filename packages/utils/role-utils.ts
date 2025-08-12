import { mapToSelectOptions } from "./select-options";
import type { Role, SelectOption } from "@southern-syntax/types";

export function mapRoleOptions<T extends Pick<Role, "id" | "key" | "name">>(
  roles: T[] | undefined,
  locale: string
): SelectOption[] {
  return mapToSelectOptions(
    roles,
    locale,
    (role) => role.name,
    (role) => role.key
  );
}
