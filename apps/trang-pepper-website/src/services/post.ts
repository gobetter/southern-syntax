// src/services/post.ts
import prisma from '@/lib/prisma'; // Import Prisma Client
export { postInputSchema } from '@/schemas/post';
import { postInputSchema, type PostInput } from '@/schemas/post';

// เมื่อ Implement RBAC (Role-Based Access Control) เต็มรูปแบบ จะต้อง Import สิ่งเหล่านี้:
// import { can } from '@/lib/auth';
// import { PERMISSION_RESOURCES, PERMISSION_ACTIONS } from '@/lib/auth/constants';

// --- Post Service ---

async function createPost(data: PostInput) {
  const validated = postInputSchema.parse(data);
  const titleEnNormalized = validated.title.en?.trim().toLowerCase() || '';
  return prisma.post.create({
    data: { ...validated, titleEnNormalized },
  });
}

async function getPostById(id: string) {
  return prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, email: true } },
      // categories: true,
      // tags: true,
    },
  });
}

async function updatePost(id: string, data: Partial<PostInput>) {
  const validated = postInputSchema.partial().parse(data);
  const titleEnNormalized = validated.title?.en?.trim().toLowerCase();
  return prisma.post.update({
    where: { id },
    data: {
      ...validated,
      ...(titleEnNormalized ? { titleEnNormalized } : {}),
    },
  });
}

async function deletePost(id: string) {
  return prisma.post.delete({ where: { id } });
}

async function getAllPosts() {
  return prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { id: true, name: true, email: true } },
    },
  });
}

async function getPublishedPosts() {
  return prisma.post.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: 'desc' }, // เรียงตามวันที่เผยแพร่
    include: {
      author: { select: { id: true, name: true, email: true } },
    },
  });
}

export const postService = {
  createPost,
  getPostById,
  updatePost,
  deletePost,
  getAllPosts,
  getPublishedPosts,
};
