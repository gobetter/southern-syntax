import { type inferProcedureOutput } from "@trpc/server";
import { type AppRouter } from "@/server/routers/_app";
import { type LocalizedString } from "@southern-syntax/types";

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
export type MediaCategoryItem = inferProcedureOutput<
  AppRouter["mediaCategory"]["getAll"]
>[number];
export type MediaTagItem = inferProcedureOutput<
  AppRouter["mediaTag"]["getAll"]
>[number];
export type RoleItem = inferProcedureOutput<
  AppRouter["role"]["getAll"]
>[number];

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
