import type { Prisma } from "@prisma/client";
import { prisma } from "@southern-syntax/db";
import {
  postCategoryInputSchema,
  type PostCategoryInput,
} from "@southern-syntax/schemas/post-category";
export { postCategoryInputSchema } from "@southern-syntax/schemas/post-category";

// --- PostCategory Service ---
async function createPostCategory(data: PostCategoryInput) {
  const validated = postCategoryInputSchema.parse(data);
  const nameEnNormalized = validated.name.en?.trim().toLowerCase() || "";
  const { description, ...rest } = validated;

  const createData: Prisma.PostCategoryCreateInput = {
    slug: rest.slug,
    name: rest.name as Prisma.JsonObject,
    nameEnNormalized,
    ...(description ? { description: description as Prisma.JsonObject } : {}),
  };

  return prisma.postCategory.create({
    data: createData,
  });
}

async function getPostCategoryById(id: string) {
  return prisma.postCategory.findUnique({ where: { id } });
}

async function updatePostCategory(
  id: string,
  data: Partial<PostCategoryInput>
) {
  const validated = postCategoryInputSchema.partial().parse(data);
  const nameEnNormalized = validated.name?.en?.trim().toLowerCase();

  const updateData: Prisma.PostCategoryUpdateInput = {
    ...(validated.slug !== undefined ? { slug: validated.slug } : {}),
    ...(validated.name !== undefined
      ? { name: validated.name as Prisma.JsonObject }
      : {}),
    ...(validated.description !== undefined
      ? { description: validated.description as Prisma.JsonObject }
      : {}),
    ...(nameEnNormalized !== undefined ? { nameEnNormalized } : {}),
  };

  return prisma.postCategory.update({
    where: { id },
    data: updateData,
  });
}

async function deletePostCategory(id: string) {
  return prisma.postCategory.delete({ where: { id } });
}

async function getAllPostCategories() {
  return prisma.postCategory.findMany({ orderBy: { name: "asc" } });
}

async function getCategoriesWithPosts() {
  return prisma.postCategory.findMany({
    include: {
      posts: {
        // include posts ที่เกี่ยวข้อง
        select: { id: true, slug: true, title: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

export const postCategoryService = {
  createPostCategory,
  getPostCategoryById,
  updatePostCategory,
  deletePostCategory,
  getAllPostCategories,
  getCategoriesWithPosts,
};
