import type { LocalizedString } from "./i18n";

export interface Permission {
  id: string;
  key: string;
  name: LocalizedString | string;
  action: string;
  resource: string;
  description?: string | null;
}

export interface Role {
  id: string;
  key: string;
  name: LocalizedString | string;
  description?: string | null;
  isSystem: boolean;
  permissions: { permissionId: string }[];
  _count: { users: number; permissions: number };
}
