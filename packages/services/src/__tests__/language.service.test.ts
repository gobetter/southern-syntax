import { describe, it, expect, beforeEach, vi } from "vitest";
import type { PrismaClient, Language } from "@prisma/client";
import { mockDeep, mockReset } from "vitest-mock-extended";
import type { LanguageInput } from "@southern-syntax/schemas/language";

const prismaMock = mockDeep<PrismaClient>();

vi.mock("@southern-syntax/db", () => ({
  default: prismaMock,
  prisma: prismaMock,
}));

// ถ้าจะทดสอบ service จากแพ็กเกจรวม ให้ import หลัง mock
let languageService: typeof import("../language").languageService;

const mockLanguage: Language = {
  id: "1",
  code: "en",
  name: "English",
  isDefault: false,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("languageService", () => {
  beforeEach(async () => {
    mockReset(prismaMock);
    vi.clearAllMocks();
    languageService = (await import("../language")).languageService;
  });

  it("createLanguage sets other defaults false when isDefault true", async () => {
    prismaMock.language.create.mockResolvedValue(mockLanguage);

    const input: LanguageInput = {
      code: "en",
      name: "English",
      isDefault: true,
      isActive: true,
    };
    const result = await languageService.createLanguage(input);

    expect(prismaMock.language.updateMany).toHaveBeenCalledWith({
      where: { isDefault: true },
      data: { isDefault: false },
    });
    expect(prismaMock.language.create).toHaveBeenCalledWith({ data: input });
    expect(result).toEqual(mockLanguage);
  });

  it("getLanguageById calls findUnique", async () => {
    prismaMock.language.findUnique.mockResolvedValue(mockLanguage);

    const result = await languageService.getLanguageById("1");

    expect(prismaMock.language.findUnique).toHaveBeenCalledWith({
      where: { id: "1" },
    });
    expect(result).toEqual(mockLanguage);
  });

  it("updateLanguage updates other defaults when setting default", async () => {
    prismaMock.language.update.mockResolvedValue(mockLanguage);

    const result = await languageService.updateLanguage("1", {
      isDefault: true,
    });

    expect(prismaMock.language.updateMany).toHaveBeenCalledWith({
      where: { isDefault: true, id: { not: "1" } },
      data: { isDefault: false },
    });
    expect(prismaMock.language.update).toHaveBeenCalled();
    expect(result).toEqual(mockLanguage);
  });

  it("deleteLanguage throws if default", async () => {
    prismaMock.language.findUnique.mockResolvedValue({
      ...mockLanguage,
      isDefault: true,
    });

    await expect(languageService.deleteLanguage("1")).rejects.toThrow(
      "Cannot delete default language."
    );
  });
});
