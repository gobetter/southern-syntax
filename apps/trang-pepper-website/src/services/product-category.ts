import type { Prisma } from "@prisma/client";
import { prisma } from "@southern-syntax/db";
import {
  productCategoryInputSchema,
  type ProductCategoryInput,
} from "@southern-syntax/schemas/product-category";
export { productCategoryInputSchema } from "@southern-syntax/schemas/product-category";

// --- ProductCategory Service ---

async function createProductCategory(data: ProductCategoryInput) {
  const validated = productCategoryInputSchema.parse(data);
  const nameEnNormalized = validated.name.en?.trim().toLowerCase() || "";

  const { description, parentId, ...rest } = validated;
  const createData: Prisma.ProductCategoryUncheckedCreateInput = {
    slug: rest.slug,
    name: rest.name as Prisma.JsonObject,
    nameEnNormalized,
    ...(description ? { description: description as Prisma.JsonObject } : {}),
    ...(parentId !== undefined ? { parentId } : {}),
  };

  return prisma.productCategory.create({
    data: createData,
  });
}

async function getProductCategoryById(id: string) {
  return prisma.productCategory.findUnique({ where: { id } });
}

async function updateProductCategory(
  id: string,
  data: Partial<ProductCategoryInput>
) {
  const validated = productCategoryInputSchema.partial().parse(data);
  const nameEnNormalized = validated.name?.en?.trim().toLowerCase();

  const updateData: Prisma.ProductCategoryUncheckedUpdateInput = {
    ...(validated.slug !== undefined ? { slug: validated.slug } : {}),
    ...(validated.name !== undefined
      ? { name: validated.name as Prisma.JsonObject }
      : {}),
    ...(validated.description !== undefined
      ? { description: validated.description as Prisma.JsonObject }
      : {}),
    ...(validated.parentId !== undefined
      ? { parentId: validated.parentId }
      : {}),
    ...(nameEnNormalized !== undefined ? { nameEnNormalized } : {}),
  };

  return prisma.productCategory.update({
    where: { id },
    data: updateData,
  });
}

async function deleteProductCategory(id: string) {
  return prisma.productCategory.delete({ where: { id } });
}

async function getAllProductCategories() {
  return prisma.productCategory.findMany({ orderBy: { name: "asc" } });
}

async function getRootProductCategories() {
  return prisma.productCategory.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
  });
}

// ดึงหมวดหมู่สินค้าพร้อม children (Recursive) - อาจซับซ้อนกว่าใน Prisma
async function getProductCategoryTree() {
  // การสร้าง Tree โครงสร้างด้วย Prisma อาจต้องใช้ Nested includes หรือ Logic ใน Application Layer
  // ตัวอย่างง่ายๆ (ไม่รวม children แบบ recursive):
  return prisma.productCategory.findMany({
    include: {
      children: true, // ดึงแค่ children ระดับแรก
      parent: true,
    },
  });
}

export const productCategoryService = {
  createProductCategory,
  getProductCategoryById,
  updateProductCategory,
  deleteProductCategory,
  getAllProductCategories,
  getRootProductCategories,
  getProductCategoryTree,
};
