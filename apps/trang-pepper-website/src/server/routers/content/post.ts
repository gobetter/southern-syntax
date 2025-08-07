// tRPC Router สำหรับ Post Module
// ทำหน้าที่เป็น API Endpoints สำหรับการจัดการข้อมูลบทความ/บล็อก

import { router, publicProcedure, authorizedProcedure } from "@/server/trpc"; // tRPC core setup
import { postInputSchema, postService } from "@/services/post"; // Post Service และ Zod Schema
import {
  PERMISSION_RESOURCES,
  PERMISSION_ACTIONS,
} from "@southern-syntax/auth"; // Constants สำหรับ RBAC
import { z } from "zod"; // Zod สำหรับ Validation Input ของ Procedure

export const postRouter = router({
  // 1. Procedure สำหรับดึงข้อมูลบทความ
  // เป็น publicProcedure: ใครก็เรียกได้ (สำหรับ Frontend Public Site หรือ Admin UI ที่ไม่ต้องการ Authentication เพื่อแค่ดูรายการ)

  // ดึงข้อมูลบทความทั้งหมด
  getAll: publicProcedure.query(async () => {
    return postService.getAllPosts();
  }),

  // ดึงข้อมูลบทความที่เผยแพร่แล้วเท่านั้น
  getPublished: publicProcedure.query(async () => {
    return postService.getPublishedPosts();
  }),

  // ดึงข้อมูลบทความด้วย ID
  getById: publicProcedure
    .input(z.object({ id: z.string().min(1, "Post ID is required") }))
    .query(async ({ input }) => {
      return postService.getPostById(input.id);
    }),

  // 2. Procedure สำหรับการจัดการบทความ (สำหรับ Admin UI)
  // ใช้ authorizedProcedure เพื่อบังคับใช้ RBAC (ต้อง Login และมีสิทธิ์)

  // สร้างบทความใหม่
  create: authorizedProcedure(
    PERMISSION_RESOURCES.POST,
    PERMISSION_ACTIONS.CREATE
  )
    .input(postInputSchema) // ใช้ Zod Schema สำหรับ Validation Input
    .mutation(async ({ input }) => {
      // สิทธิ์ถูกตรวจสอบโดย authorizedProcedure middleware แล้ว
      return postService.createPost(input);
    }),

  // อัปเดตข้อมูลบทความ
  update: authorizedProcedure(
    PERMISSION_RESOURCES.POST,
    PERMISSION_ACTIONS.UPDATE
  )
    .input(
      z.object({
        id: z.string().min(1, "Post ID is required"),
        data: postInputSchema.partial(),
      })
    ) // Schema สำหรับ Partial Update
    .mutation(async ({ input }) => {
      // สิทธิ์ถูกตรวจสอบโดย authorizedProcedure middleware แล้ว
      return postService.updatePost(input.id, input.data);
    }),

  // ลบบทความ
  delete: authorizedProcedure(
    PERMISSION_RESOURCES.POST,
    PERMISSION_ACTIONS.DELETE
  )
    .input(z.object({ id: z.string().min(1, "Post ID is required") })) // กำหนด Input Schema ด้วย Zod
    .mutation(async ({ input }) => {
      // สิทธิ์ถูกตรวจสอบโดย authorizedProcedure middleware แล้ว
      return postService.deletePost(input.id);
    }),
});
