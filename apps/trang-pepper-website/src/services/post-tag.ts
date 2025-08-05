// src/services/post-tag.ts
import prisma from '@/lib/prisma'; // Import Prisma Client
export { postTagInputSchema } from '@/schemas/post-tag';
import { postTagInputSchema, type PostTagInput } from '@/schemas/post-tag';

// เมื่อ Implement RBAC (Role-Based Access Control) เต็มรูปแบบ จะต้อง Import สิ่งเหล่านี้:
// import { can } from '@/lib/auth';
// import { PERMISSION_RESOURCES, PERMISSION_ACTIONS } from '@/lib/auth/constants';

// --- PostTag Service ---

const postTagUpdateSchema = postTagInputSchema.partial();

async function createPostTag(data: PostTagInput) {
  const validated = postTagInputSchema.parse(data);
  const nameEnNormalized = validated.name.en?.trim().toLowerCase() || '';
  return prisma.postTag.create({
    data: { ...validated, nameEnNormalized },
  });
}

async function getPostTagById(id: string) {
  return prisma.postTag.findUnique({ where: { id } });
}

async function updatePostTag(id: string, data: Partial<PostTagInput>) {
  const validated = postTagUpdateSchema.parse(data);
  const nameEnNormalized = validated.name?.en?.trim().toLowerCase();
  return prisma.postTag.update({
    where: { id },
    data: {
      ...validated,
      ...(nameEnNormalized ? { nameEnNormalized } : {}),
    },
  });
}

async function deletePostTag(id: string) {
  return prisma.postTag.delete({ where: { id } });
}

async function getAllPostTags() {
  return prisma.postTag.findMany({ orderBy: { name: 'asc' } });
}

async function getTagsWithPosts() {
  return prisma.postTag.findMany({
    include: {
      posts: {
        // include posts ที่เกี่ยวข้อง
        select: { id: true, slug: true, title: true },
      },
    },
    orderBy: { name: 'asc' },
  });
}

export const postTagService = {
  createPostTag,
  getPostTagById,
  updatePostTag,
  deletePostTag,
  getAllPostTags,
  getTagsWithPosts,
};
