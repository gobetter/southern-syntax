// tRPC Router สำหรับ PostCategory Module
// ทำหน้าที่เป็น API Endpoints สำหรับการจัดการข้อมูลหมวดหมู่บทความ

import { router, publicProcedure, authorizedProcedure } from "@/server/trpc"; // tRPC core setup
import {
  postCategoryInputSchema,
  postCategoryService,
} from "@/services/post-category"; // PostCategory Service และ Zod Schema
import {
  PERMISSION_RESOURCES,
  PERMISSION_ACTIONS,
} from "@southern-syntax/auth"; // Constants สำหรับ RBAC
import { z } from "zod"; // Zod สำหรับ Validation Input ของ Procedure
import type { PostCategoryInput } from "@southern-syntax/schemas/post-category";
function omitUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
}

export const postCategoryRouter = router({
  // 1. Procedure สำหรับดึงข้อมูลหมวดหมู่บทความ
  // เป็น publicProcedure: ใครก็เรียกได้ (สำหรับ Frontend Public Site หรือ Admin UI ที่ไม่ต้องการ Authentication เพื่อแค่ดูรายการ)

  // ดึงข้อมูลหมวดหมู่บทความทั้งหมด
  getAll: publicProcedure.query(async () => {
    return postCategoryService.getAllPostCategories();
  }),

  // ดึงหมวดหมู่บทความพร้อม posts ที่เกี่ยวข้อง
  getCategoriesWithPosts: publicProcedure.query(async () => {
    return postCategoryService.getCategoriesWithPosts();
  }),

  // ดึงข้อมูลหมวดหมู่บทความด้วย ID
  getById: publicProcedure
    .input(z.object({ id: z.string().min(1, "Category ID is required") }))
    .query(async ({ input }) => {
      return postCategoryService.getPostCategoryById(input.id);
    }),

  // 2. Procedure สำหรับการจัดการหมวดหมู่บทความ (สำหรับ Admin UI)
  // ใช้ authorizedProcedure เพื่อบังคับใช้ RBAC (ต้อง Login และมีสิทธิ์)

  // สร้างหมวดหมู่บทความใหม่
  create: authorizedProcedure(
    PERMISSION_RESOURCES.POST_CATEGORY,
    PERMISSION_ACTIONS.CREATE
  )
    .input(postCategoryInputSchema)
    .mutation(async ({ input }) => {
      // สิทธิ์ถูกตรวจสอบโดย authorizedProcedure middleware แล้ว
      const sanitizedInput = omitUndefined(input) as PostCategoryInput;
      return postCategoryService.createPostCategory(sanitizedInput);
    }),

  // อัปเดตข้อมูลหมวดหมู่บทความ
  update: authorizedProcedure(
    PERMISSION_RESOURCES.POST_CATEGORY,
    PERMISSION_ACTIONS.UPDATE
  )
    .input(
      z.object({
        id: z.string().min(1, "Category ID is required"),
        data: postCategoryInputSchema.partial(),
      })
    )
    .mutation(async ({ input }) => {
      // สิทธิ์ถูกตรวจสอบโดย authorizedProcedure middleware แล้ว
      const sanitizedData = omitUndefined(
        input.data
      ) as Partial<PostCategoryInput>;
      return postCategoryService.updatePostCategory(input.id, sanitizedData);
    }),

  // ลบหมวดหมู่บทความ
  delete: authorizedProcedure(
    PERMISSION_RESOURCES.POST_CATEGORY,
    PERMISSION_ACTIONS.DELETE
  )
    .input(z.object({ id: z.string().min(1, "Category ID is required") }))
    .mutation(async ({ input }) => {
      // สิทธิ์ถูกตรวจสอบโดย authorizedProcedure middleware แล้ว
      return postCategoryService.deletePostCategory(input.id);
    }),
});
