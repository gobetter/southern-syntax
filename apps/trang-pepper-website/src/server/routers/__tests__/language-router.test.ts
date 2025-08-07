import { describe, it, expect, beforeEach, vi } from "vitest";
import type { PrismaClient, Language } from "@prisma/client";
import type { Session } from "next-auth";

vi.mock("@southern-syntax/auth/server", () => ({
  authOptions: {},
}));
vi.mock("@southern-syntax/auth", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    can: vi.fn().mockReturnValue(true),
  };
});
vi.mock("@southern-syntax/db", () => ({ default: {} }));

import { languageRouter } from "../content/language";
import { languageService } from "@southern-syntax/services";

const mockLanguage: Language = {
  id: "1",
  code: "en",
  name: "English",
  isDefault: false,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("languageRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAll calls service", async () => {
    const spy = vi
      .spyOn(languageService, "getAllLanguages")
      .mockResolvedValue([]);
    const caller = languageRouter.createCaller({
      session: null,
      prisma: {} as unknown as PrismaClient,
    });
    await caller.getAll();
    expect(spy).toHaveBeenCalled();
  });

  it("create calls service", async () => {
    const spy = vi
      .spyOn(languageService, "createLanguage")
      .mockResolvedValue(mockLanguage);
    const session: Session = {
      user: {
        id: "u1",
        name: "Test User",
        email: "test@test.com",
        role: "ADMIN",
        permissions: {}, // ใส่ข้อมูล permission จำลองถ้าจำเป็น
      },
      expires: "some-date",
    };
    const caller = languageRouter.createCaller({
      session,
      prisma: {} as unknown as PrismaClient,
    });
    const input = {
      code: "en",
      name: "English",
      isDefault: false,
      isActive: true,
    };
    const result = await caller.create(input);
    expect(spy).toHaveBeenCalledWith(input);
    expect(result).toEqual(mockLanguage);
  });
});
