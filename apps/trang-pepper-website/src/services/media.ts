import type { Prisma } from "@prisma/client";

import {
  mediaUpdateFormInputSchema,
  type MediaUpdateFormInput,
  type MediaUploadInput,
} from "@southern-syntax/schemas/media";
import type { LocalizedString } from "@southern-syntax/types";
import { getEnv } from "@southern-syntax/config";
import prisma from "@southern-syntax/db";
import {
  extractStoragePaths,
  sanitizeFilename,
  calculateFileHash,
  DuplicateFileError,
  supabase,
} from "@southern-syntax/utils";

import type { MediaSortableField } from "@/constants/media";
import type { SortOrder } from "@/constants/common";
import { AUDIT_ACTIONS } from "@/constants/auditActions";

import { auditLogService } from "./auditLog";
import { processImage } from "./image-processing";

const BUCKET_NAME = getEnv().SUPABASE_BUCKET_NAME;

// สร้าง Helper function ข้างนอก service object
function createSearchText(data: {
  title?: LocalizedString;
  altText?: LocalizedString;
  caption?: LocalizedString;
}): string {
  const searchableValues = [
    ...Object.values(data.title || {}),
    ...Object.values(data.altText || {}),
    ...Object.values(data.caption || {}),
  ];
  return searchableValues.join(" ");
}

type MediaRelation = "categories" | "tags";

interface UpdateRelationInput {
  mediaIds: string[];
  addIds?: string[];
  removeIds?: string[];
}

async function updateMediaRelations(
  relation: MediaRelation,
  { mediaIds, addIds = [], removeIds = [] }: UpdateRelationInput
) {
  const updatePromises = mediaIds.map((mediaId) =>
    prisma.media.update({
      where: { id: mediaId },
      data: {
        [relation]: {
          connect: addIds.map((id) => ({ id })),
          disconnect: removeIds.map((id) => ({ id })),
        },
      },
    })
  );
  return prisma.$transaction(updatePromises);
}

async function setMediaRelations(
  relation: MediaRelation,
  mediaIds: string[],
  ids: string[]
) {
  const updatePromises = mediaIds.map((mediaId) =>
    prisma.media.update({
      where: { id: mediaId },
      data: {
        [relation]: {
          set: ids.map((id) => ({ id })),
        },
      },
    })
  );
  return prisma.$transaction(updatePromises);
}

async function getMediaById(id: string) {
  return prisma.media.findUnique({ where: { id } });
}

async function uploadMedia(
  input: MediaUploadInput & {
    buffer: Buffer;
    userId: string;
    categoryId?: string;
    tagIds?: string[];
  },
  actorId: string
) {
  const {
    filename,
    mimeType,
    fileSize,
    buffer,
    title,
    altText,
    caption,
    userId,
    categoryId,
    tagIds,
  } = input;

  // กรณีใช้ browser + UTF-8 อยู่แล้ว อาจไม่จำเป็นต้อง decode
  // แต่ถ้าใช้กับ Linux CLI หรือ multer จาก Server อาจต้องแน่ใจว่าเป็น UTF-8
  const decodedFilename = Buffer.from(filename, "binary").toString("utf-8");

  // หรือใช้ sanitizeFilename แล้วแยกส่วน original เก็บไว้ด้วย
  const safeFilename = sanitizeFilename(decodedFilename); // ← จากชื่อไฟล์ต้นฉบับ

  const fileHash = calculateFileHash(buffer); // คำนวณ hash

  // ตรวจสอบว่ามีไฟล์ซ้ำหรือไม่
  const existing = await prisma.media.findUnique({ where: { fileHash } });
  if (existing) {
    // โยน Error เหมือนเดิม แต่ตอนนี้เราส่ง context เข้าไปได้ด้วย
    // สมมติว่า `originalFilename` คือชื่อไฟล์จาก input
    throw new DuplicateFileError({ filename });
  }

  const processedVariants = await processImage(buffer, safeFilename);
  const variantUrls: Record<string, string> = {};
  const timestamp = Date.now();

  await Promise.all(
    processedVariants.map(async (variant) => {
      const variantFileName = `${timestamp}-${variant.name}-${safeFilename}`;
      const filePath = `${userId}/${Date.now()}-${variantFileName}`;

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, variant.buffer, {
          contentType: variant.mimeType,
          upsert: false, // 🔐 ป้องกันเขียนทับ
        });
      if (error) {
        throw new Error(
          `Supabase upload failed for ${variant.name}: ${error.message}`
        );
      }
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path);
      variantUrls[variant.name] = publicUrlData.publicUrl;
    })
  );

  // สร้าง searchText
  const searchText = createSearchText({ title, altText, caption });

  // ดึงค่า title ภาษาอังกฤษ (หรือภาษาหลักของคุณ) มาเป็นค่าสำหรับ sort
  const titleSort =
    (title as LocalizedString)?.["en"] ||
    decodedFilename.replace(/\.[^/.]+$/, "");

  const newMedia = await prisma.media.create({
    data: {
      originalFilename: decodedFilename,
      filename: safeFilename,
      originalUrl: variantUrls["original"],
      mimeType,
      fileSize,
      fileHash,
      title: title || {},
      altText: altText || {},
      caption: caption || {},
      variants: variantUrls,
      searchText: searchText, // บันทึก searchText
      titleSort: titleSort,
      categories: categoryId ? { connect: { id: categoryId } } : undefined,
      tags:
        tagIds && tagIds.length > 0
          ? { connect: tagIds.map((id) => ({ id })) }
          : undefined,
    },
  });

  await auditLogService.createLog({
    actorId,
    action: AUDIT_ACTIONS.MEDIA_UPLOADED,
    entityType: "MEDIA",
    entityId: newMedia.id,
    details: { newData: newMedia },
  });

  return newMedia;
}

async function getAllMedia(input: {
  searchQuery?: string;
  page: number;
  pageSize: number;
  categoryId?: string;
  tagId?: string;
  sortBy?: MediaSortableField;
  sortOrder?: SortOrder;
}) {
  const { searchQuery, page, pageSize, categoryId, tagId, sortBy, sortOrder } =
    input;

  // คำนวณค่า skip สำหรับ Prisma
  const skip = (page - 1) * pageSize;

  // สร้างเงื่อนไขการค้นหา (เหมือนเดิม)
  const where: Prisma.MediaWhereInput = {};

  // จัดการเงื่อนไขการค้นหา (Search)
  if (searchQuery) {
    where.OR = [
      {
        filename: {
          contains: searchQuery,
          mode: "insensitive",
        },
      },
      {
        searchText: {
          contains: searchQuery,
          mode: "insensitive",
        },
      },
    ];
  }

  // จัดการเงื่อนไขการกรอง (Filter)
  if (categoryId) {
    where.categories = { some: { id: categoryId } };
  }
  if (tagId) {
    where.tags = { some: { id: tagId } };
  }

  const orderBy: Prisma.MediaOrderByWithRelationInput = sortBy
    ? { [sortBy]: sortOrder || "asc" }
    : { createdAt: "desc" };

  // ใช้ prisma.$transaction เพื่อดึงข้อมูลและนับจำนวนพร้อมกัน
  // การใช้ $transaction จะทำให้การ findMany และ count เกิดขึ้นใน "Database Transaction" เดียวกัน
  // ซึ่งมีประสิทธิภาพและแม่นยำกว่าการเรียกแยกกัน
  const [data, totalCount] = await prisma.$transaction([
    prisma.media.findMany({
      where,
      take: pageSize,
      skip: skip,
      orderBy,
      include: {
        categories: true, // บอกให้ดึงข้อมูล categories ที่เกี่ยวข้องมาด้วย
        tags: true, // บอกให้ดึงข้อมูล tags ที่เกี่ยวข้องมาด้วย
      },
    }),
    prisma.media.count({
      where,
    }),
  ]);

  // ส่งข้อมูลทั้งสองส่วนกลับไป
  return {
    data,
    totalCount,
  };
}

async function updateMedia(
  id: string,
  data: MediaUpdateFormInput,
  actorId: string
) {
  const oldData = await prisma.media.findUnique({ where: { id } });
  const validatedData = mediaUpdateFormInputSchema.parse(data);
  const { title, altText, caption, categoryIds, tagIds } = validatedData;

  // สร้าง searchText สำหรับข้อมูลใหม่
  const searchText = createSearchText(validatedData);
  const titleSort = (title as LocalizedString)?.["en"] || undefined;

  const updatedMedia = await prisma.media.update({
    where: { id },
    data: {
      title,
      altText,
      caption,
      searchText: searchText, // อัปเดต searchText ด้วย
      titleSort: titleSort, // อัปเดต titleSort ด้วย
      // ใช้ `set` operation เพื่อกำหนดความสัมพันธ์ใหม่ทั้งหมด
      categories: { set: categoryIds ? categoryIds.map((id) => ({ id })) : [] },
      tags: tagIds
        ? { set: tagIds.map((tagId) => ({ id: tagId })) }
        : undefined,
    },
    include: { categories: true, tags: true },
  });

  await auditLogService.createLog({
    actorId,
    action: AUDIT_ACTIONS.MEDIA_UPDATED,
    entityType: "MEDIA",
    entityId: updatedMedia.id,
    details: { oldData, newData: updatedMedia },
  });

  return updatedMedia;
}

async function deleteMedia(id: string, actorId: string) {
  const oldData = await prisma.media.findUnique({ where: { id } });
  if (!oldData) throw new Error("Media not found");
  if (oldData.isSystem) throw new Error("Cannot delete system media.");

  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) throw new Error("Media not found");
  if (media.isSystem) throw new Error("Cannot delete system media.");

  if (media.variants) {
    const filePathsToDelete = extractStoragePaths(media.variants, BUCKET_NAME);
    if (filePathsToDelete.length > 0) {
      const { error: deleteError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(filePathsToDelete);
      if (deleteError) {
        console.error(
          "Failed to delete files from Supabase Storage:",
          deleteError.message
        );
      }
    }
  }

  const deletedMedia = await prisma.media.delete({ where: { id } });

  await auditLogService.createLog({
    actorId,
    action: AUDIT_ACTIONS.MEDIA_DELETED,
    entityType: "MEDIA",
    entityId: id,
    details: { oldData },
  });

  return deletedMedia;
}

async function deleteManyMedia(ids: string[], actorId: string) {
  const oldData = await prisma.media.findMany({
    where: { id: { in: ids }, isSystem: false },
  });
  if (oldData.length === 0) return { count: 0 };

  // ดึงข้อมูล Media ทั้งหมดที่ตรงกับ ID ที่ส่งมา
  const mediaItemsToDelete = await prisma.media.findMany({
    where: {
      id: { in: ids },
      isSystem: false, // ป้องกันการลบไฟล์ของระบบ
    },
  });

  if (mediaItemsToDelete.length === 0) {
    return { count: 0 };
  }

  // รวบรวม Path ของไฟล์ทั้งหมดใน Storage ที่ต้องลบ
  const filePathsToDelete: string[] = [];
  mediaItemsToDelete.forEach((media) => {
    const paths = extractStoragePaths(media.variants, BUCKET_NAME);
    filePathsToDelete.push(...paths);
  });

  // สั่งลบไฟล์ทั้งหมดจาก Supabase Storage ในครั้งเดียว
  if (filePathsToDelete.length > 0) {
    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(filePathsToDelete);

    if (deleteError) {
      // ใน Production ควรใช้ Logger ที่ดีกว่านี้
      console.error(
        "Failed to delete some files from Supabase Storage:",
        deleteError.message
      );
      // เราอาจจะเลือกที่จะไม่หยุดการทำงาน และลบข้อมูลใน DB ต่อไป
    }
  }

  // สั่งลบข้อมูลทั้งหมดจาก Database ในครั้งเดียว
  const { count } = await prisma.media.deleteMany({
    where: { id: { in: oldData.map((item) => item.id) } },
  });

  // Add a single audit log for the bulk action
  await auditLogService.createLog({
    actorId,
    action: AUDIT_ACTIONS.MEDIA_DELETED_BULK,
    entityType: "MEDIA",
    entityId: `bulk-delete-${oldData.length}-items`,
    details: { deletedCount: count, deletedItems: oldData },
  });

  return { count };
}

async function updateMediaCategories(input: {
  mediaIds: string[];
  addIds?: string[];
  removeIds?: string[];
}) {
  return updateMediaRelations("categories", input);
}

async function setMediaCategories(input: {
  mediaIds: string[];
  categoryIds: string[];
}) {
  return setMediaRelations("categories", input.mediaIds, input.categoryIds);
}

async function updateMediaTags(input: {
  mediaIds: string[];
  addIds?: string[];
  removeIds?: string[];
}) {
  return updateMediaRelations("tags", input);
}

async function setMediaTags(input: { mediaIds: string[]; tagIds: string[] }) {
  return setMediaRelations("tags", input.mediaIds, input.tagIds);
}

export const mediaService = {
  getMediaById,
  uploadMedia,
  getAllMedia,
  updateMedia,
  deleteMedia,
  deleteManyMedia,
  updateMediaCategories,
  setMediaCategories,
  updateMediaTags,
  setMediaTags,
};
