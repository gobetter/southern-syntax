// src/services/product-category.ts
import prisma from '@/lib/prisma'; // Import Prisma Client
export { productCategoryInputSchema } from '@/schemas/product-category';
import { productCategoryInputSchema, type ProductCategoryInput } from '@/schemas/product-category';

// เมื่อ Implement RBAC (Role-Based Access Control) เต็มรูปแบบ จะต้อง Import สิ่งเหล่านี้:
// import { can } from '@/lib/auth';
// import { PERMISSION_RESOURCES, PERMISSION_ACTIONS } from '@/lib/auth/constants';

// --- ProductCategory Service ---

async function createProductCategory(data: ProductCategoryInput) {
  const validated = productCategoryInputSchema.parse(data);
  const nameEnNormalized = validated.name.en?.trim().toLowerCase() || '';
  return prisma.productCategory.create({
    data: { ...validated, nameEnNormalized },
  });
}

async function getProductCategoryById(id: string) {
  return prisma.productCategory.findUnique({ where: { id } });
}

async function updateProductCategory(id: string, data: Partial<ProductCategoryInput>) {
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
  return prisma.productCategory.findMany({ orderBy: { name: 'asc' } });
}

async function getRootProductCategories() {
  return prisma.productCategory.findMany({
    where: { parentId: null },
    orderBy: { name: 'asc' },
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
