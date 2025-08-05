import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { PrismaClient, Product, Prisma } from '@prisma/client';
import type { Session } from 'next-auth';

vi.mock('@/lib/auth', () => ({ authOptions: {}, can: vi.fn().mockResolvedValue(true) }));
vi.mock('@/lib/prisma', () => ({ default: {} }));

import { productRouter } from '../content/product';
import { productService } from '@/services/product';

const mockProduct: Product = {
  id: '1',
  slug: 'p',
  title: { en: 'p' },
  description: {},
  price: 1 as unknown as Prisma.Decimal,
  stock: 1,
  isPublished: false,
  featuredImageId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('productRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAll returns products from service', async () => {
    const spy = vi.spyOn(productService, 'getAllProducts').mockResolvedValue([mockProduct]);
    const caller = productRouter.createCaller({
      session: null,
      prisma: {} as unknown as PrismaClient,
    });
    const result = await caller.getAll();
    expect(spy).toHaveBeenCalled();
    expect(result).toEqual([mockProduct]);
  });

  it('create calls service with input', async () => {
    const spy = vi.spyOn(productService, 'createProduct').mockResolvedValue(mockProduct);
    const session: Session = { user: { id: 'u1' }, expires: '' };
    const caller = productRouter.createCaller({ session, prisma: {} as unknown as PrismaClient });
    const input = { slug: 'p', title: { en: 'p' }, price: 1, stock: 1, isPublished: false };
    const result = await caller.create(input);
    expect(spy).toHaveBeenCalledWith(input);
    expect(result).toEqual(mockProduct);
  });
});
