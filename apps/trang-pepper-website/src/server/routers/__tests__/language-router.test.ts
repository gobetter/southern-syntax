import { describe, it, expect, beforeEach, vi } from "vitest";
import type { PrismaClient, Language } from "@prisma/client";
import type { Session } from "next-auth";

vi.mock("@southern-syntax/auth", () => ({
  authOptions: {},
  can: vi.fn().mockResolvedValue(true),
}));
vi.mock("@southern-syntax/db", () => ({ default: {} }));

import { languageRouter } from "../content/language";
import { languageService } from "@/services/language";

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
    const session: Session = { user: { id: "u1" }, expires: "" };
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
