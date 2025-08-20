import { mapToSelectOptions } from "./select-options";
import type {
  Role,
  SelectOption,
  LocalizedString,
} from "@southern-syntax/types";
import { defaultLocale } from "@southern-syntax/config";

function toLocalizedOrUndef(
  v: string | LocalizedString | null | undefined
): LocalizedString | undefined {
  if (v == null) return undefined;
  return typeof v === "string" ? { [defaultLocale]: v } : v;
}

export function mapRoleOptions<T extends Pick<Role, "id" | "key" | "name">>(
  roles: T[] | undefined,
  locale: string
): SelectOption[] {
  return mapToSelectOptions(
    roles ?? [],
    locale,
    (role) => toLocalizedOrUndef(role.name),
    (role) => role.key
  );
}
