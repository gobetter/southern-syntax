// src/schemas/post-category.ts
import { z } from "zod";
import type { LocalizedString } from "@southern-syntax/types";

export const postCategoryInputSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  name: z
    .record(z.string(), z.string().min(1, "Category name cannot be empty"))
    .refine(
      (obj) => Object.keys(obj).length > 0,
      "At least one language name is required"
    ),
  description: z.record(z.string(), z.string()).optional(),
});

export type PostCategoryInput = z.infer<typeof postCategoryInputSchema> & {
  name: LocalizedString;
  description?: LocalizedString;
};
