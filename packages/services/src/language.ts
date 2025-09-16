import { prisma } from "@southern-syntax/db";
import type { Prisma } from "@southern-syntax/db";
import {
  languageInputSchema,
  type LanguageInput,
} from "@southern-syntax/schemas/language";
export { languageInputSchema } from "@southern-syntax/schemas/language";

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

  const patch: Prisma.LanguageUpdateInput = {
    ...(validatedData.code !== undefined && { code: validatedData.code }),
    ...(validatedData.name !== undefined && { name: validatedData.name }),
    ...(validatedData.isDefault !== undefined && {
      isDefault: validatedData.isDefault,
    }),
    ...(validatedData.isActive !== undefined && {
      isActive: validatedData.isActive,
    }),
  };

  if (validatedData.isDefault === true) {
    await prisma.language.updateMany({
      where: { isDefault: true, id: { not: id } },
      data: { isDefault: false },
    });
  }
  const updatedLanguage = await prisma.language.update({
    where: { id },
    // data: validatedData,
    data: patch,
  });
  return updatedLanguage;
}

async function deleteLanguage(id: string) {
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
