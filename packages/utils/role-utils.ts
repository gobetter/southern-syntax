// src/lib/role-utils.ts
// import { getLocalizedString } from '@/i18n/utils';
import { mapToSelectOptions } from './select-options';
import type { RoleItem } from '@/types/trpc';

export interface RoleOption {
  id: string;
  label: string;
}

export function mapRoleOptions(roles: RoleItem[] | undefined, locale: string): RoleOption[] {
  return mapToSelectOptions(
    roles,
    locale,
    (role) => role.name,
    (role) => role.key,
  ) as RoleOption[];
}
