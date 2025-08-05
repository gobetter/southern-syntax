// src/schemas/post.ts
import { z } from 'zod';
import type { LocalizedString } from '@/types/i18n';

export const postInputSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  title: z
    .record(z.string(), z.string().min(1, 'Title cannot be empty'))
    .refine((obj) => Object.keys(obj).length > 0, 'At least one language title is required'),
  content: z
    .record(z.string(), z.string().min(1, 'Content cannot be empty'))
    .refine((obj) => Object.keys(obj).length > 0, 'At least one language content is required'),
  excerpt: z.record(z.string(), z.string()).optional(),
  authorId: z.string().min(1, 'Author ID is required'),
  isPublished: z.boolean().default(false),
  publishedAt: z.date().optional().nullable(),
  featuredImageId: z.string().optional().nullable(),
  // categoryIds: z.array(z.string()).optional(), // หากใช้ Many-to-Many ผ่าน ID array
  // tagIds: z.array(z.string()).optional(),
});

export type PostInput = z.infer<typeof postInputSchema> & {
  title: LocalizedString;
  content: LocalizedString;
  excerpt?: LocalizedString;
};
