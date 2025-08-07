import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import prisma from "@southern-syntax/db";
import { type MediaTagInput } from "@southern-syntax/schemas/media-taxonomy";

import { AUDIT_ACTIONS } from "@/constants/auditActions";

import { auditLogService } from "./auditLog";

async function getAll() {
  return prisma.mediaTag.findMany({
    orderBy: { createdAt: "desc" },
  });
}

async function create(input: MediaTagInput, actorId: string) {
  const nameEnNormalized = input.name.en?.trim().toLowerCase();

  const existingSlug = await prisma.mediaTag.findUnique({
    where: { slug: input.slug },
  });
  if (existingSlug) {
    throw new TRPCError({ code: "CONFLICT", message: "SLUG_ALREADY_EXISTS" });
  }

  if (nameEnNormalized) {
    const existingName = await prisma.mediaTag.findUnique({
      where: { nameEnNormalized },
    });
    if (existingName) {
      throw new TRPCError({ code: "CONFLICT", message: "NAME_ALREADY_EXISTS" });
    }
  }

  const newTag = await prisma.mediaTag.create({
    data: {
      name: input.name as Prisma.JsonObject,
      slug: input.slug,
      nameEnNormalized: nameEnNormalized || "",
    },
  });

  await auditLogService.createLog({
    actorId,
    action: AUDIT_ACTIONS.MEDIA_TAG_CREATED,
    entityType: "MEDIA_TAG",
    entityId: newTag.id,
    details: { newData: newTag },
  });

  return newTag;
}

async function update(id: string, input: MediaTagInput, actorId: string) {
  const oldData = await prisma.mediaTag.findUnique({ where: { id } });
  const nameEnNormalized = input.name.en?.trim().toLowerCase();

  const existingSlug = await prisma.mediaTag.findFirst({
    where: { slug: input.slug, id: { not: id } },
  });
  if (existingSlug) {
    throw new TRPCError({ code: "CONFLICT", message: "SLUG_ALREADY_EXISTS" });
  }

  if (nameEnNormalized) {
    const existingName = await prisma.mediaTag.findFirst({
      where: { nameEnNormalized, id: { not: id } },
    });
    if (existingName) {
      throw new TRPCError({ code: "CONFLICT", message: "NAME_ALREADY_EXISTS" });
    }
  }

  const updatedTag = await prisma.mediaTag.update({
    where: { id },
    data: {
      name: input.name as Prisma.JsonObject,
      slug: input.slug,
      nameEnNormalized: nameEnNormalized,
    },
  });

  await auditLogService.createLog({
    actorId,
    action: AUDIT_ACTIONS.MEDIA_TAG_UPDATED,
    entityType: "MEDIA_TAG",
    entityId: updatedTag.id,
    details: { oldData, newData: updatedTag },
  });

  return updatedTag;
}

async function deleteTag(id: string, actorId: string) {
  const oldData = await prisma.mediaTag.findUnique({ where: { id } });
  if (!oldData) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Tag not found" });
  }

  const deletedTag = await prisma.mediaTag.delete({ where: { id } });

  // 8. ✅ บันทึก Log หลังจากลบสำเร็จ
  await auditLogService.createLog({
    actorId,
    action: AUDIT_ACTIONS.MEDIA_TAG_DELETED,
    entityType: "MEDIA_TAG",
    entityId: id,
    details: { oldData },
  });

  return deletedTag;
}

export const mediaTagService = {
  getAll,
  create,
  update,
  delete: deleteTag,
};
