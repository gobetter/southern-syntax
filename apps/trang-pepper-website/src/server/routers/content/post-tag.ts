// src/server/routers/content/post-tag.ts
// tRPC Router สำหรับ PostTag Module
// ทำหน้าที่เป็น API Endpoints สำหรับการจัดการข้อมูลแท็กบทความ

import { router, publicProcedure, authorizedProcedure } from '@/server/trpc'; // tRPC core setup
import { postTagInputSchema, postTagService } from '@/services/post-tag'; // PostTag Service และ Zod Schema
import { PERMISSION_RESOURCES, PERMISSION_ACTIONS } from '@/lib/auth/constants'; // Constants สำหรับ RBAC
import { z } from 'zod'; // Zod สำหรับ Validation Input ของ Procedure

export const postTagRouter = router({
  // 1. Procedure สำหรับดึงข้อมูลแท็กบทความ
  // เป็น publicProcedure: ใครก็เรียกได้ (สำหรับ Frontend Public Site หรือ Admin UI ที่ไม่ต้องการ Authentication เพื่อแค่ดูรายการ)

  // ดึงข้อมูลแท็กบทความทั้งหมด
  getAll: publicProcedure.query(async () => {
    return postTagService.getAllPostTags();
  }),

  // ดึงแท็กบทความพร้อม posts ที่เกี่ยวข้อง
  getTagsWithPosts: publicProcedure.query(async () => {
    return postTagService.getTagsWithPosts();
  }),

  // ดึงข้อมูลแท็กบทความด้วย ID
  getById: publicProcedure
    .input(z.object({ id: z.string().min(1, 'Tag ID is required') }))
    .query(async ({ input }) => {
      return postTagService.getPostTagById(input.id);
    }),

  // 2. Procedure สำหรับการจัดการแท็กบทความ (สำหรับ Admin UI)
  // ใช้ authorizedProcedure เพื่อบังคับใช้ RBAC (ต้อง Login และมีสิทธิ์)

  // สร้างแท็กบทความใหม่
  create: authorizedProcedure(PERMISSION_RESOURCES.POST, PERMISSION_ACTIONS.CREATE) // Resource POST เพราะเป็นของ blog/post
    .input(postTagInputSchema)
    .mutation(async ({ input }) => {
      // สิทธิ์ถูกตรวจสอบโดย authorizedProcedure middleware แล้ว
      return postTagService.createPostTag(input);
    }),

  // อัปเดตข้อมูลแท็กบทความ
  update: authorizedProcedure(PERMISSION_RESOURCES.POST, PERMISSION_ACTIONS.UPDATE) // Resource POST
    .input(
      z.object({ id: z.string().min(1, 'Tag ID is required'), data: postTagInputSchema.partial() }),
    )
    .mutation(async ({ input }) => {
      // สิทธิ์ถูกตรวจสอบโดย authorizedProcedure middleware แล้ว
      return postTagService.updatePostTag(input.id, input.data);
    }),

  // ลบแท็กบทความ
  delete: authorizedProcedure(PERMISSION_RESOURCES.POST, PERMISSION_ACTIONS.DELETE) // Resource POST
    .input(z.object({ id: z.string().min(1, 'Tag ID is required') }))
    .mutation(async ({ input }) => {
      // สิทธิ์ถูกตรวจสอบโดย authorizedProcedure middleware แล้ว
      return postTagService.deletePostTag(input.id);
    }),
});
