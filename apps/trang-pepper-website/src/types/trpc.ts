import { type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "@/server/routers/_app";
import { type LocalizedString } from "@southern-syntax/types";

export type RouterOutputs = inferRouterOutputs<AppRouter>;
export type UserItem = RouterOutputs["user"]["getAll"]["data"][number];
export interface MediaItem {
  id: string;
  filename: string;
  mimeType: string;
  fileSize: number;
  originalUrl: string;
  variants?: Record<string, string>;
  title: LocalizedString | null;
  altText: LocalizedString | null;
  caption: LocalizedString | null;
  createdAt: string;
  categories: { id: string; name: LocalizedString; slug: string }[];
  tags: { id: string; name: LocalizedString; slug: string }[];
}
export type MediaCategoryItem =
  RouterOutputs["mediaCategory"]["getAll"][number];
export type MediaTagItem = RouterOutputs["mediaTag"]["getAll"][number];
export type RoleItem = RouterOutputs["role"]["getAll"][number];

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
