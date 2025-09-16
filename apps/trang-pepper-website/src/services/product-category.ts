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
  return prisma.productCategory.create({
    data: { ...validated, nameEnNormalized },
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
  return prisma.productCategory.update({
    where: { id },
    data: {
      ...validated,
      ...(nameEnNormalized ? { nameEnNormalized } : {}),
    },
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
