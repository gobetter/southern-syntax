import type { LocalizedString } from "@southern-syntax/types";

export interface UserItem {
  id: string;
  email: string;
  name: LocalizedString | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  role: {
    id: string;
    key: string;
    name: LocalizedString | null;
    description?: string | null;
    isSystem?: boolean;
    isSelectableOnRegistration?: boolean;
  } | null;
}
