import type { LocalizedString } from "./i18n";

export interface AuthenticatedUser {
  id: string;
  name: LocalizedString | string | null;
  email: string;
  role?: string | null;
}

export type RegisteredUser = {
  id: string;
  email: string;
  name: LocalizedString | string | null;
  roleId: string | null;
  isActive: boolean;
};
