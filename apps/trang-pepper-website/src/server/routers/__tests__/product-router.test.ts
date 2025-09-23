import { describe, it, expect, beforeEach, vi } from "vitest";
import type { PrismaClient, Product} from "@prisma/client";
import { Prisma } from "@prisma/client";
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

import { productRouter } from "../content/product";
import { productService } from "@southern-syntax/domain-admin/product";

const mockProduct: Product = {
  id: "p1",
  slug: "test-product",
  title: { en: "Test Product" },
  description: {},
  price: new Prisma.Decimal(100),
  stock: 10,
  isPublished: false,
  featuredImageId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  titleEnNormalized: "test product",
  productTagId: null,
};

describe("productRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAll returns products from service", async () => {
    const spy = vi
      .spyOn(productService, "getAllProducts")
      .mockResolvedValue([mockProduct]);
    const caller = productRouter.createCaller({
      session: null,
      prisma: {} as unknown as PrismaClient,
    });
    const result = await caller.getAll();
    expect(spy).toHaveBeenCalled();
    expect(result).toEqual([mockProduct]);
  });

  it("create calls service with input", async () => {
    const spy = vi
      .spyOn(productService, "createProduct")
      .mockResolvedValue(mockProduct);
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
    const caller = productRouter.createCaller({
      session,
      prisma: {} as unknown as PrismaClient,
    });
    const input = {
      slug: "p",
      title: { en: "p" },
      price: 1,
      stock: 1,
      isPublished: false,
    };
    const result = await caller.create(input);
    expect(spy).toHaveBeenCalledWith(input);
    expect(result).toEqual(mockProduct);
  });
});
