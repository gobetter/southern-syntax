import prisma from "@southern-syntax/db";
import {
  productInputSchema,
  type ProductInput,
} from "@southern-syntax/schemas/product";
export { productInputSchema } from "@southern-syntax/schemas/product";

// --- Product Service ---
// Service นี้จะรวม Business Logic สำหรับ Product Model
async function createProduct(data: ProductInput) {
  const validated = productInputSchema.parse(data);
  const titleEnNormalized = validated.title.en?.trim().toLowerCase() || "";
  return prisma.product.create({
    data: { ...validated, titleEnNormalized },
  });
}

async function getProductById(id: string) {
  return prisma.product.findUnique({ where: { id } });
}

async function updateProduct(id: string, data: Partial<ProductInput>) {
  const validated = productInputSchema.partial().parse(data);
  const titleEnNormalized = validated.title?.en?.trim().toLowerCase();
  return prisma.product.update({
    where: { id },
    data: {
      ...validated,
      ...(titleEnNormalized ? { titleEnNormalized } : {}),
    },
  });
}

async function deleteProduct(id: string) {
  return prisma.product.delete({ where: { id } });
}

async function getAllProducts() {
  return prisma.product.findMany({ orderBy: { createdAt: "desc" } });
}

async function getPublishedProducts() {
  return prisma.product.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
  });
}

export const productService = {
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getPublishedProducts,
};
