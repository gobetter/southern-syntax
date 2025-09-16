import type { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { prisma } from "@southern-syntax/db";
import { type MediaCategoryInput } from "@southern-syntax/schemas/media-taxonomy";
import { AUDIT_ACTIONS } from "@southern-syntax/constants/audit-actions";

import { auditLogService } from "./audit-log";

async function getAll() {
  return prisma.mediaCategory.findMany({
    orderBy: { name: "desc" },
  });
}

async function create(input: MediaCategoryInput, actorId: string) {
  // สร้าง "ชื่อมาตรฐาน"
  const { name, slug } = input;
  const nameEnNormalized = name.en?.trim().toLowerCase();

  const existingSlug = await prisma.mediaCategory.findUnique({
    where: { slug: slug },
  });
  if (existingSlug) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "SLUG_ALREADY_EXISTS",
    });
  }

  if (nameEnNormalized) {
    const existingName = await prisma.mediaCategory.findUnique({
      where: { nameEnNormalized },
    });
    if (existingName) {
      throw new TRPCError({ code: "CONFLICT", message: "NAME_ALREADY_EXISTS" });
    }
  }

  const newCategory = await prisma.mediaCategory.create({
    data: {
      name: name as Prisma.JsonObject,
      slug: slug,
      nameEnNormalized: nameEnNormalized || "",
    },
  });

  await auditLogService.createLog({
    actorId,
    action: AUDIT_ACTIONS.MEDIA_CATEGORY_CREATED,
    entityType: "MEDIA_CATEGORY",
    entityId: newCategory.id,
    details: { newData: newCategory },
  });

  return newCategory;
}

async function update(id: string, input: MediaCategoryInput, actorId: string) {
  const oldData = await prisma.mediaCategory.findUnique({ where: { id } });
  // สร้าง "ชื่อมาตรฐาน" และตรวจสอบข้อมูลซ้ำ
  const nameEnNormalized = input.name.en?.trim().toLowerCase();

  // ตรวจสอบ Slug ซ้ำกับรายการอื่น (ที่ไม่ใช่ตัวเอง)
  const existingSlug = await prisma.mediaCategory.findFirst({
    where: { slug: input.slug, id: { not: id } },
  });

  if (existingSlug) {
    throw new TRPCError({ code: "CONFLICT", message: "SLUG_ALREADY_EXISTS" });
  }

  if (nameEnNormalized) {
    const existingName = await prisma.mediaCategory.findFirst({
      where: { nameEnNormalized, id: { not: id } },
    });
    if (existingName) {
      throw new TRPCError({ code: "CONFLICT", message: "NAME_ALREADY_EXISTS" });
    }
  }

  const updatedCategory = await prisma.mediaCategory.update({
    where: { id },
    data: {
      name: input.name as Prisma.JsonObject,
      slug: input.slug,
      nameEnNormalized: nameEnNormalized,
    },
  });

  await auditLogService.createLog({
    actorId,
    action: AUDIT_ACTIONS.MEDIA_CATEGORY_UPDATED,
    entityType: "MEDIA_CATEGORY",
    entityId: updatedCategory.id,
    details: { oldData, newData: updatedCategory },
  });

  return updatedCategory;
}

async function deleteCategory(id: string, actorId: string) {
  const oldData = await prisma.mediaCategory.findUnique({ where: { id } });
  if (!oldData) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Category not found" });
  }

  const deletedCategory = await prisma.mediaCategory.delete({ where: { id } });

  await auditLogService.createLog({
    actorId,
    action: AUDIT_ACTIONS.MEDIA_CATEGORY_DELETED,
    entityType: "MEDIA_CATEGORY",
    entityId: id, // ใช้ id ที่ส่งเข้ามา
    details: { oldData },
  });

  return deletedCategory;
}

export const mediaCategoryService = {
  create,
  getAll,
  update,
  delete: deleteCategory,
};
