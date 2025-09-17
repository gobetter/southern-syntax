import type { Prisma } from "@prisma/client";
import { prisma } from "@southern-syntax/db";
export { postInputSchema } from "@southern-syntax/schemas/post";
import { postInputSchema, type PostInput } from "@southern-syntax/schemas/post";

// --- Post Service ---

async function createPost(data: PostInput) {
  const validated = postInputSchema.parse(data);
  const titleEnNormalized = validated.title.en?.trim().toLowerCase() || "";

  const { excerpt, publishedAt, featuredImageId, ...rest } = validated;
  const createData: Prisma.PostUncheckedCreateInput = {
    slug: rest.slug,
    title: rest.title as Prisma.JsonObject,
    content: rest.content as Prisma.JsonObject,
    authorId: rest.authorId,
    isPublished: rest.isPublished,
    titleEnNormalized,
    ...(excerpt ? { excerpt: excerpt as Prisma.JsonObject } : {}),
    ...(publishedAt !== undefined ? { publishedAt } : {}),
    ...(featuredImageId !== undefined ? { featuredImageId } : {}),
  };

  return prisma.post.create({
    data: createData,
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

  const updateData: Prisma.PostUncheckedUpdateInput = {
    ...(validated.slug !== undefined ? { slug: validated.slug } : {}),
    ...(validated.title !== undefined
      ? { title: validated.title as Prisma.JsonObject }
      : {}),
    ...(validated.content !== undefined
      ? { content: validated.content as Prisma.JsonObject }
      : {}),
    ...(validated.excerpt !== undefined
      ? { excerpt: validated.excerpt as Prisma.JsonObject }
      : {}),
    ...(validated.authorId !== undefined
      ? { authorId: validated.authorId }
      : {}),
    ...(validated.isPublished !== undefined
      ? { isPublished: validated.isPublished }
      : {}),
    ...(validated.publishedAt !== undefined
      ? { publishedAt: validated.publishedAt }
      : {}),
    ...(validated.featuredImageId !== undefined
      ? { featuredImageId: validated.featuredImageId }
      : {}),
    ...(titleEnNormalized !== undefined ? { titleEnNormalized } : {}),
  };

  return prisma.post.update({
    where: { id },
    data: updateData,
  });
}

async function deletePost(id: string) {
  return prisma.post.delete({ where: { id } });
}

async function getAllPosts() {
  return prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true, email: true } },
    },
  });
}

async function getPublishedPosts() {
  return prisma.post.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" }, // เรียงตามวันที่เผยแพร่
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
