// tRPC Router สำหรับ Language Module
// ทำหน้าที่เป็น API Endpoints สำหรับการจัดการข้อมูลภาษา

import { router, publicProcedure, authorizedProcedure } from "@/server/trpc"; // tRPC core setup
import {
  languageInputSchema,
  languageService,
} from "@southern-syntax/services"; // Language Service และ Zod Schema
import {
  PERMISSION_RESOURCES,
  PERMISSION_ACTIONS,
} from "@southern-syntax/auth"; // Constants สำหรับ RBAC
import { z } from "zod"; // Zod สำหรับ Validation Input ของ Procedure

export const languageRouter = router({
  // 1. Procedure สำหรับดึงข้อมูลภาษา
  // เป็น publicProcedure: ใครก็เรียกได้ (สำหรับ Frontend Public Site หรือ Admin UI ที่ไม่ต้องการ Authentication เพื่อแค่ดูรายการภาษา)

  // ดึงข้อมูลภาษาทั้งหมด
  getAll: publicProcedure.query(async () => {
    return languageService.getAllLanguages();
  }),

  // ดึงข้อมูลภาษาที่เปิดใช้งาน (สำหรับ Frontend Public Site)
  getActive: publicProcedure.query(async () => {
    return languageService.getActiveLanguages();
  }),

  // ดึงข้อมูลภาษาด้วย ID
  getById: publicProcedure
    .input(z.object({ id: z.string().min(1, "Language ID is required") }))
    .query(async ({ input }) => {
      return languageService.getLanguageById(input.id);
    }),

  // ดึงข้อมูลภาษาด้วย Code
  getByCode: publicProcedure
    .input(z.object({ code: z.string().min(1, "Language code is required") }))
    .query(async ({ input }) => {
      return languageService.getLanguageByCode(input.code);
    }),

  // 2. Procedure สำหรับการจัดการภาษา (สำหรับ Admin UI)
  // ใช้ authorizedProcedure เพื่อบังคับใช้ RBAC (ต้อง Login และมีสิทธิ์)

  // สร้างภาษาใหม่
  create: authorizedProcedure(
    PERMISSION_RESOURCES.SETTINGS,
    PERMISSION_ACTIONS.CREATE
  )
    .input(languageInputSchema)
    .mutation(async ({ input }) => {
      // สิทธิ์ถูกตรวจสอบโดย authorizedProcedure middleware แล้ว
      return languageService.createLanguage(input);
    }),

  // อัปเดตข้อมูลภาษา
  update: authorizedProcedure(
    PERMISSION_RESOURCES.SETTINGS,
    PERMISSION_ACTIONS.UPDATE
  )
    .input(
      z.object({
        id: z.string().min(1, "Language ID is required"),
        data: languageInputSchema.partial(),
      })
    )
    // .mutation(async ({ input }) => {
    //   // สิทธิ์ถูกตรวจสอบโดย authorizedProcedure middleware แล้ว
    //   return languageService.updateLanguage(input.id, input.data);
    // }),
    .mutation(async ({ input }) => {
      const data = {
        ...(input.data.name !== undefined ? { name: input.data.name } : {}),
        ...(input.data.code !== undefined ? { slug: input.data.code } : {}),
        ...(input.data.isActive !== undefined
          ? { description: input.data.isActive }
          : {}),
        ...(input.data.isDefault !== undefined
          ? { description: input.data.isDefault }
          : {}),
      };
      return languageService.updateLanguage(input.id, data);
    }),

  // ลบภาษา
  delete: authorizedProcedure(
    PERMISSION_RESOURCES.SETTINGS,
    PERMISSION_ACTIONS.DELETE
  )
    .input(z.object({ id: z.string().min(1, "Language ID is required") }))
    .mutation(async ({ input }) => {
      // สิทธิ์ถูกตรวจสอบโดย authorizedProcedure middleware แล้ว
      return languageService.deleteLanguage(input.id);
    }),
});
