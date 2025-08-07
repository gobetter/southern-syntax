import type { LocalizedString } from "@southern-syntax/types";

// export interface UserItem {
//   id: string;
//   name: LocalizedString | null;
//   email: string;
//   role: { id: string; key: string; name: LocalizedString | string } | null;
//   isActive: boolean;
// }

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
