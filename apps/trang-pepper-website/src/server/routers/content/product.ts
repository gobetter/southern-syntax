// src/server/routers/content/product.ts
import { router, publicProcedure, authorizedProcedure } from "@/server/trpc";
import { productInputSchema, productService } from "@/services/product"; // Import Product Service
import {
  PERMISSION_RESOURCES,
  PERMISSION_ACTIONS,
} from "@southern-syntax/auth/constants"; // Constants สำหรับ RBAC
import { z } from "zod"; // Zod สำหรับ Input Validation

export const productRouter = router({
  // publicProcedure: สำหรับ API ที่ใครก็เรียกได้ (เช่น การแสดงสินค้าใน Frontend Public Site)
  getById: publicProcedure
    .input(z.object({ id: z.string() })) // กำหนด Input Schema ด้วย Zod
    .query(async ({ input }) => {
      // เรียกใช้ Product Service
      return productService.getProductById(input.id);
    }),

  getAll: publicProcedure.query(async () => {
    // เรียกใช้ Product Service
    return productService.getAllProducts();
  }),

  getPublished: publicProcedure.query(async () => {
    return productService.getPublishedProducts();
  }),

  // Procedure สำหรับการจัดการสินค้า (สำหรับ Admin UI)
  // ใช้ authorizedProcedure เพื่อบังคับใช้ RBAC (ต้อง Login และมีสิทธิ์)

  // สร้างสินค้าใหม่
  create: authorizedProcedure(
    PERMISSION_RESOURCES.PRODUCT,
    PERMISSION_ACTIONS.CREATE
  ) // <-- เปลี่ยนจาก protectedProcedure เป็น authorizedProcedure
    .input(productInputSchema) // ใช้ Zod Schema สำหรับ Validation Input
    .mutation(async ({ input }) => {
      // <-- ลบ ctx ออก เพราะ authorizedProcedure จัดการ session แล้ว
      // สิทธิ์ถูกตรวจสอบโดย authorizedProcedure middleware แล้ว
      // ไม่จำเป็นต้องเขียน const hasPermission = await can(...) อีก
      return productService.createProduct(input);
    }),

  // อัปเดตข้อมูลสินค้า
  update: authorizedProcedure(
    PERMISSION_RESOURCES.PRODUCT,
    PERMISSION_ACTIONS.UPDATE
  )
    .input(
      z.object({
        id: z.string().min(1, "Product ID is required"),
        data: productInputSchema.partial(),
      })
    )
    .mutation(async ({ input }) => {
      return productService.updateProduct(input.id, input.data);
    }),

  // ลบสินค้า
  delete: authorizedProcedure(
    PERMISSION_RESOURCES.PRODUCT,
    PERMISSION_ACTIONS.DELETE
  )
    .input(z.object({ id: z.string().min(1, "Product ID is required") }))
    .mutation(async ({ input }) => {
      return productService.deleteProduct(input.id);
    }),
});
