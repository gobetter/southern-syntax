import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Prisma, PrismaClient, Product } from "@prisma/client";
import { mockDeep, mockReset } from "vitest-mock-extended";

// สร้าง prisma mock ก้อนเดียว ใช้ร่วมกัน
const prismaMock = mockDeep<PrismaClient>();

// สำคัญ: mock ทั้งสองเส้นทางที่ service อาจ import
vi.mock("@southern-syntax/db", () => ({
  default: prismaMock,
  prisma: prismaMock,
}));

// อย่า import service ไว้บนสุด ให้ import แบบ dynamic หลัง mock เสมอ
let productService: typeof import("../product").productService;

const mockProduct: Product = {
  id: "1",
  slug: "p1",
  title: { en: "P1" },
  titleEnNormalized: "p1",
  description: {},
  price: 1 as unknown as Prisma.Decimal,
  stock: 1,
  isPublished: false,
  featuredImageId: null,
  productTagId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("productService", () => {
  beforeEach(async () => {
    mockReset(prismaMock);
    vi.clearAllMocks();
    productService = (await import("../product")).productService;
  });

  it("createProduct calls prisma.create with normalized title", async () => {
    const input = {
      slug: "p1",
      title: { en: "P1" },
      price: 1,
      stock: 1,
      isPublished: false,
    };
    prismaMock.product.create.mockResolvedValue(mockProduct);

    const result = await productService.createProduct(input);

    expect(prismaMock.product.create).toHaveBeenCalledWith({
      data: { ...input, titleEnNormalized: "p1" },
    });
    expect(result).toEqual(mockProduct);
  });

  it("getProductById uses findUnique", async () => {
    prismaMock.product.findUnique.mockResolvedValue(mockProduct);

    const result = await productService.getProductById("1");

    expect(prismaMock.product.findUnique).toHaveBeenCalledWith({
      where: { id: "1" },
    });
    expect(result).toEqual(mockProduct);
  });

  it("updateProduct uses prisma.update with normalized title", async () => {
    prismaMock.product.update.mockResolvedValue({
      ...mockProduct,
      title: { en: "u" },
    });

    const result = await productService.updateProduct("1", {
      title: { en: "u" },
    });

    expect(prismaMock.product.update).toHaveBeenCalledWith({
      where: { id: "1" },
      data: { title: { en: "u" }, titleEnNormalized: "u" },
    });
    expect(result).toEqual({ ...mockProduct, title: { en: "u" } });
  });

  it("deleteProduct calls prisma.delete", async () => {
    prismaMock.product.delete.mockResolvedValue(mockProduct);

    const result = await productService.deleteProduct("1");

    expect(prismaMock.product.delete).toHaveBeenCalledWith({
      where: { id: "1" },
    });
    expect(result).toEqual(mockProduct);
  });

  it("getAllProducts orders by createdAt desc", async () => {
    prismaMock.product.findMany.mockResolvedValue([]);

    await productService.getAllProducts();

    expect(prismaMock.product.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: "desc" },
    });
  });

  it("getPublishedProducts filters published", async () => {
    prismaMock.product.findMany.mockResolvedValue([]);

    await productService.getPublishedProducts();

    expect(prismaMock.product.findMany).toHaveBeenCalledWith({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
    });
  });
});
