// src/services/post-category.ts
import prisma from "@southern-syntax/db";
import {
  postCategoryInputSchema,
  type PostCategoryInput,
} from "@southern-syntax/schemas/post-category";
export { postCategoryInputSchema } from "@southern-syntax/schemas/post-category";

// เมื่อ Implement RBAC (Role-Based Access Control) เต็มรูปแบบ จะต้อง Import สิ่งเหล่านี้:
// import { can } from '@/lib/auth';
// import { PERMISSION_RESOURCES, PERMISSION_ACTIONS } from '@/lib/auth/constants';

// --- PostCategory Service ---
async function createPostCategory(data: PostCategoryInput) {
  const validated = postCategoryInputSchema.parse(data);
  const nameEnNormalized = validated.name.en?.trim().toLowerCase() || "";
  return prisma.postCategory.create({
    data: { ...validated, nameEnNormalized },
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
  return prisma.postCategory.update({
    where: { id },
    data: {
      ...validated,
      ...(nameEnNormalized ? { nameEnNormalized } : {}),
    },
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
