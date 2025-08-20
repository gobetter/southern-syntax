import type { LocalizedString } from "./i18n";

export interface AuditLogItem {
  id: string;
  userId: string | null;
  user: {
    id: string;
    name: LocalizedString | null;
    email: string | null;
  } | null;
  entityId: string | null;
  entityType: string | null;
  action: string;
  details: Record<string, unknown>;
  createdAt: string;
}
