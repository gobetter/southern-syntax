import type { Prisma } from "@prisma/client";
import { prisma } from "@southern-syntax/db";
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
  const { description, featuredImageId, ...rest } = validated;

  const createData: Prisma.ProductUncheckedCreateInput = {
    slug: rest.slug,
    title: rest.title as Prisma.JsonObject,
    price: rest.price,
    stock: rest.stock,
    isPublished: rest.isPublished,
    titleEnNormalized,
    ...(description ? { description: description as Prisma.JsonObject } : {}),
    ...(featuredImageId !== undefined ? { featuredImageId } : {}),
  };

  return prisma.product.create({
    data: createData,
  });
}

async function getProductById(id: string) {
  return prisma.product.findUnique({ where: { id } });
}

async function updateProduct(id: string, data: Partial<ProductInput>) {
  const validated = productInputSchema.partial().parse(data);
  const titleEnNormalized = validated.title?.en?.trim().toLowerCase();

  const updateData: Prisma.ProductUncheckedUpdateInput = {
    ...(validated.slug !== undefined ? { slug: validated.slug } : {}),
    ...(validated.title !== undefined
      ? { title: validated.title as Prisma.JsonObject }
      : {}),
    ...(validated.description !== undefined
      ? { description: validated.description as Prisma.JsonObject }
      : {}),
    ...(validated.price !== undefined ? { price: validated.price } : {}),
    ...(validated.stock !== undefined ? { stock: validated.stock } : {}),
    ...(validated.isPublished !== undefined
      ? { isPublished: validated.isPublished }
      : {}),
    ...(validated.featuredImageId !== undefined
      ? { featuredImageId: validated.featuredImageId }
      : {}),
    ...(titleEnNormalized !== undefined ? { titleEnNormalized } : {}),
  };
  return prisma.product.update({
    where: { id },
    data: updateData,
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
