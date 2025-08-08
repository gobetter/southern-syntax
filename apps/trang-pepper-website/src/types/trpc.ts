import { type inferProcedureOutput } from "@trpc/server";
import { type AppRouter } from "@/server/routers/_app";
import { type MediaItem, type AuditLogItem } from "@southern-syntax/types";

export type MediaCategoryItem = inferProcedureOutput<
  AppRouter["mediaCategory"]["getAll"]
>[number];

export type MediaTagItem = inferProcedureOutput<
  AppRouter["mediaTag"]["getAll"]
>[number];

export type RoleItem = inferProcedureOutput<
  AppRouter["role"]["getAll"]
>[number];

export type { MediaItem, AuditLogItem };
