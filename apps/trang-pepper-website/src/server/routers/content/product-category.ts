// tRPC Router สำหรับ ProductCategory Module
// ทำหน้าที่เป็น API Endpoints สำหรับการจัดการข้อมูลหมวดหมู่สินค้า

// ลบ protectedProcedure ออกจาก import เพราะไม่ได้ใช้โดยตรง
import { router, publicProcedure, authorizedProcedure } from "@southern-syntax/trpc"; // tRPC core setup
import {
  productCategoryInputSchema,
  productCategoryService,
} from "@southern-syntax/domain-admin/product-category"; // ProductCategory Service และ Zod Schema
import {
  PERMISSION_RESOURCES,
  PERMISSION_ACTIONS,
} from "@southern-syntax/auth"; // Constants สำหรับ RBAC
import { z } from "zod"; // Zod สำหรับ Validation Input ของ Procedure
import type { ProductCategoryInput } from "@southern-syntax/schemas/product-category";

function omitUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
}

export const productCategoryRouter = router({
  // 1. Procedure สำหรับดึงข้อมูลหมวดหมู่สินค้า
  // เป็น publicProcedure: ใครก็เรียกได้ (สำหรับ Frontend Public Site หรือ Admin UI ที่ไม่ต้องการ Authentication เพื่อแค่ดูรายการ)

  // ดึงข้อมูลหมวดหมู่สินค้าทั้งหมด
  getAll: publicProcedure.query(async () => {
    return productCategoryService.getAllProductCategories();
  }),

  // ดึงหมวดหมู่สินค้าหลัก (ไม่มี parentId)
  getRootCategories: publicProcedure.query(async () => {
    return productCategoryService.getRootProductCategories();
  }),

  // ดึงหมวดหมู่สินค้าพร้อม children (สำหรับการสร้าง Tree Structure ใน UI)
  getTree: publicProcedure.query(async () => {
    return productCategoryService.getProductCategoryTree();
  }),

  // ดึงข้อมูลหมวดหมู่สินค้าด้วย ID
  getById: publicProcedure
    .input(z.object({ id: z.string().min(1, "Category ID is required") }))
    .query(async ({ input }) => {
      return productCategoryService.getProductCategoryById(input.id);
    }),

  // 2. Procedure สำหรับการจัดการหมวดหมู่สินค้า (สำหรับ Admin UI)
  // ใช้ authorizedProcedure เพื่อบังคับใช้ RBAC (ต้อง Login และมีสิทธิ์)

  // สร้างหมวดหมู่สินค้าใหม่
  create: authorizedProcedure(
    PERMISSION_RESOURCES.PRODUCT_CATEGORY,
    PERMISSION_ACTIONS.CREATE
  )
    .input(productCategoryInputSchema)
    .mutation(async ({ input }) => {
      // สิทธิ์ถูกตรวจสอบโดย authorizedProcedure middleware แล้ว
      const sanitizedInput = omitUndefined(input) as ProductCategoryInput;
      return productCategoryService.createProductCategory(sanitizedInput);
    }),

  // อัปเดตข้อมูลหมวดหมู่สินค้า
  update: authorizedProcedure(
    PERMISSION_RESOURCES.PRODUCT_CATEGORY,
    PERMISSION_ACTIONS.UPDATE
  )
    .input(
      z.object({
        id: z.string().min(1, "Category ID is required"),
        data: productCategoryInputSchema.partial(),
      })
    )
    .mutation(async ({ input }) => {
      // สิทธิ์ถูกตรวจสอบโดย authorizedProcedure middleware แล้ว
      const sanitizedData = omitUndefined(
        input.data
      ) as Partial<ProductCategoryInput>;
      return productCategoryService.updateProductCategory(
        input.id,
        sanitizedData
      );
    }),

  // ลบหมวดหมู่สินค้า
  delete: authorizedProcedure(
    PERMISSION_RESOURCES.PRODUCT_CATEGORY,
    PERMISSION_ACTIONS.DELETE
  )
    .input(z.object({ id: z.string().min(1, "Category ID is required") }))
    .mutation(async ({ input }) => {
      // สิทธิ์ถูกตรวจสอบโดย authorizedProcedure middleware แล้ว
      return productCategoryService.deleteProductCategory(input.id);
    }),
});
