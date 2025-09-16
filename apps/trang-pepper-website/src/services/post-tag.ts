import { prisma } from "@southern-syntax/db";
import {
  postTagInputSchema,
  type PostTagInput,
} from "@southern-syntax/schemas/post-tag";
export { postTagInputSchema } from "@southern-syntax/schemas/post-tag";

// --- PostTag Service ---

const postTagUpdateSchema = postTagInputSchema.partial();

async function createPostTag(data: PostTagInput) {
  const validated = postTagInputSchema.parse(data);
  const nameEnNormalized = validated.name.en?.trim().toLowerCase() || "";
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
  return prisma.postTag.findMany({ orderBy: { name: "asc" } });
}

async function getTagsWithPosts() {
  return prisma.postTag.findMany({
    include: {
      posts: {
        // include posts ที่เกี่ยวข้อง
        select: { id: true, slug: true, title: true },
      },
    },
    orderBy: { name: "asc" },
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
