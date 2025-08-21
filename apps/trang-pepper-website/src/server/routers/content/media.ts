import { z } from "zod";

import {
  PERMISSION_ACTIONS,
  PERMISSION_RESOURCES,
} from "@southern-syntax/auth";
import { mediaUpdateFormInputSchema } from "@southern-syntax/schemas/media";

import { router, authorizedProcedure } from "@/server/trpc";
import { mediaService } from "@/services/media";
import { MEDIA_SORTABLE_FIELDS } from "@southern-syntax/constants/media";
import { SORT_ORDERS } from "@southern-syntax/types";

export const mediaRouter = router({
  // ดึง media ทั้งหมดพร้อม pagination และ search
  getAll: authorizedProcedure(
    PERMISSION_RESOURCES.MEDIA,
    PERMISSION_ACTIONS.READ
  )
    .input(
      z.object({
        searchQuery: z.string().optional(),
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(12), // default 12 รูปต่อหน้า
        categoryId: z.string().optional(),
        tagId: z.string().optional(),
        sortBy: z.enum(MEDIA_SORTABLE_FIELDS).optional(),
        sortOrder: z.enum(SORT_ORDERS).optional(),
      })
    )
    .query(async ({ input }) => {
      // ส่ง searchQuery ไปให้ service
      return mediaService.getAllMedia(input);
    }),

  // อัปเดต metadata ของ media
  update: authorizedProcedure(
    PERMISSION_RESOURCES.MEDIA,
    PERMISSION_ACTIONS.UPDATE
  )
    .input(z.object({ id: z.string(), data: mediaUpdateFormInputSchema }))
    .mutation(async ({ input, ctx }) => {
      const actorId = ctx.session.user.id;
      return mediaService.updateMedia(input.id, input.data, actorId);
    }),

  // ลบ media หนึ่งรายการ
  delete: authorizedProcedure(
    PERMISSION_RESOURCES.MEDIA,
    PERMISSION_ACTIONS.DELETE // ต้องมีสิทธิ์ DELETE MEDIA เท่านั้น
  )
    .input(
      z.object({
        id: z.string(), // รับ id ของ media ที่จะลบ
      })
    )
    .mutation(async ({ input, ctx }) => {
      const actorId = ctx.session.user.id;
      return mediaService.deleteMedia(input.id, actorId);
    }),

  // ลบ media หลายรายการ
  deleteMany: authorizedProcedure(
    PERMISSION_RESOURCES.MEDIA,
    PERMISSION_ACTIONS.DELETE
  )
    .input(
      z.object({
        ids: z.array(z.string()).min(1), // รับ Array ของ string ที่มีอย่างน้อย 1 รายการ
      })
    )
    .mutation(async ({ input, ctx }) => {
      const actorId = ctx.session.user.id;
      return mediaService.deleteManyMedia(input.ids, actorId);
    }),

  updateCategories: authorizedProcedure(
    PERMISSION_RESOURCES.MEDIA,
    PERMISSION_ACTIONS.UPDATE
  )
    .input(
      z.object({
        mediaIds: z.array(z.string()).min(1),
        addIds: z.array(z.string()).optional(),
        removeIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      return mediaService.updateMediaCategories(input);
    }),

  setCategories: authorizedProcedure(
    PERMISSION_RESOURCES.MEDIA,
    PERMISSION_ACTIONS.UPDATE
  )
    .input(
      z.object({
        mediaIds: z.array(z.string()).min(1),
        categoryIds: z.array(z.string()), // ไม่ต้อง min(1) เพราะอาจ set เป็น [] ได้
      })
    )
    .mutation(async ({ input }) => {
      return mediaService.setMediaCategories(input);
    }),

  updateTags: authorizedProcedure(
    PERMISSION_RESOURCES.MEDIA,
    PERMISSION_ACTIONS.UPDATE
  )
    .input(
      z.object({
        mediaIds: z.array(z.string()).min(1),
        addIds: z.array(z.string()).optional(),
        removeIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      return mediaService.updateMediaTags(input);
    }),

  setTags: authorizedProcedure(
    PERMISSION_RESOURCES.MEDIA,
    PERMISSION_ACTIONS.UPDATE
  )
    .input(
      z.object({
        mediaIds: z.array(z.string()).min(1),
        tagIds: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      return mediaService.setMediaTags(input);
    }),
});
