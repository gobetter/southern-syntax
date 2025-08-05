// src/schemas/product-category.ts
import { z } from 'zod';
import type { LocalizedString } from '@/types/i18n';

export const productCategoryInputSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  name: z
    .record(z.string(), z.string().min(1, 'Category name cannot be empty'))
    .refine((obj) => Object.keys(obj).length > 0, 'At least one language name is required'),
  description: z.record(z.string(), z.string()).optional(),
  parentId: z.string().optional().nullable(),
});

export type ProductCategoryInput = z.infer<typeof productCategoryInputSchema> & {
  name: LocalizedString;
  description?: LocalizedString;
};
