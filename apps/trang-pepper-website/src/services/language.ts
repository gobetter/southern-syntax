import prisma from "@southern-syntax/db";
import {
  languageInputSchema,
  type LanguageInput,
} from "@southern-syntax/schemas/language";
export { languageInputSchema } from "@southern-syntax/schemas/language";
// import type { Prisma } from '@prisma/client';

// const languageUpdateSchema = languageInputSchema.partial();

// เมื่อ Implement RBAC (Role-Based Access Control) เต็มรูปแบบ จะต้อง Import สิ่งเหล่านี้:
// import { can } from '@/lib/auth';
// import { PERMISSION_RESOURCES, PERMISSION_ACTIONS } from '@/lib/auth/constants';

// --- Language Service ---
async function createLanguage(data: LanguageInput) {
  const validatedData = languageInputSchema.parse(data);

  if (validatedData.isDefault) {
    await prisma.language.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    });
  }

  return prisma.language.create({ data: validatedData });
}

async function getLanguageById(id: string) {
  return prisma.language.findUnique({ where: { id } });
}

// ดึงภาษาด้วย Code (e.g., "en", "th")
async function getLanguageByCode(code: string) {
  return prisma.language.findUnique({ where: { code } });
}

async function updateLanguage(id: string, data: Partial<LanguageInput>) {
  const validatedData = languageInputSchema.partial().parse(data);
  if (validatedData.isDefault === true) {
    await prisma.language.updateMany({
      where: { isDefault: true, id: { not: id } },
      data: { isDefault: false },
    });
  }
  const updatedLanguage = await prisma.language.update({
    where: { id },
    data: validatedData,
  });
  return updatedLanguage;
}

async function deleteLanguage(id: string) {
  // ใน Application จริง จะมีการตรวจสอบสิทธิ์ RBAC ที่นี่
  // if (!await can(ctx.session, PERMISSION_RESOURCES.LANGUAGE, PERMISSION_ACTIONS.DELETE)) {
  //   throw new Error('FORBIDDEN');
  // }
  const language = await prisma.language.findUnique({ where: { id } });
  if (!language) throw new Error("Language not found");
  if (language.isDefault) throw new Error("Cannot delete default language.");

  return prisma.language.findMany({ orderBy: { name: "asc" } });
}

async function getAllLanguages() {
  return prisma.language.findMany({ orderBy: { name: "asc" } });
}

// ดึงภาษาที่เปิดใช้งาน (สำหรับ Frontend Public Site)
async function getActiveLanguages() {
  return prisma.language.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}

export const languageService = {
  createLanguage,
  getLanguageById,
  getLanguageByCode,
  updateLanguage,
  deleteLanguage,
  getAllLanguages,
  getActiveLanguages,
};
