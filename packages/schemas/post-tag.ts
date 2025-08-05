// src/schemas/post-tag.ts
import { z } from 'zod';
import type { LocalizedString } from '@/types/i18n';

export const postTagInputSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  name: z
    .record(z.string(), z.string().min(1, 'Tag name cannot be empty'))
    .refine((obj) => Object.keys(obj).length > 0, 'At least one language name is required'),
});

export type PostTagInput = z.infer<typeof postTagInputSchema> & {
  name: LocalizedString;
};
