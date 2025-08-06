import { type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "@/server/routers/_app";
import { type LocalizedString } from "@southern-syntax/types";

/**
 * Type กลางสำหรับ tRPC outputs ทั้งหมด
 * @link https://trpc.io/docs/reactjs/scaffolding#infer-router-types
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;

/**
 * Type สำหรับข้อมูล User หนึ่งคน ที่ได้จาก procedure 'user.getAll'
 */
// export type UserItem = RouterOutputs['user']['getAll'][number];
export type UserItem = RouterOutputs["user"]["getAll"]["data"][number];

/**
 * Type สำหรับข้อมูล Media หนึ่งชิ้น ที่ได้จาก procedure 'media.getAll'
 * ซึ่งจะมี `categories` และ `tags` ติดมาด้วยโดยอัตโนมัติ
 */
export type MediaItem = RouterOutputs["media"]["getAll"]["data"][number];

/**
 * Type สำหรับข้อมูล Media Category หนึ่งรายการ ที่ได้จาก 'mediaCategory.getAll'
 */
export type MediaCategoryItem =
  RouterOutputs["mediaCategory"]["getAll"][number];

/**
 * Type สำหรับข้อมูล Media Tag หนึ่งรายการ ที่ได้จาก 'mediaTag.getAll'
 */
export type MediaTagItem = RouterOutputs["mediaTag"]["getAll"][number];

/**
 * Type สำหรับข้อมูล Role หนึ่งรายการ ที่ได้จาก 'role.getAll'
 */
export type RoleItem = RouterOutputs["role"]["getAll"][number];

/**
 * Type สำหรับข้อมูล Audit Log หนึ่งรายการ ที่ได้จาก 'auditLog.getAll'
 */
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
