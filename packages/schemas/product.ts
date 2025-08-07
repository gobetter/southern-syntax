import { z } from "zod";
import type { LocalizedString } from "@southern-syntax/types";

export const productInputSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  // title จะเป็น LocalizedString (JSONB)
  title: z
    .record(z.string(), z.string().min(1, "Title cannot be empty"))
    .refine(
      (obj) => Object.keys(obj).length > 0,
      "At least one language title is required"
    ),
  // description จะเป็น LocalizedString (JSONB)
  description: z.record(z.string(), z.string()).optional(),
  price: z.number().positive("Price must be positive"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  isPublished: z.boolean().default(false),
  featuredImageId: z.string().optional(),
  // categoryIds: z.array(z.string()).optional(), // หากเป็น Many-to-Many ผ่าน ID array
});

export type ProductInput = z.infer<typeof productInputSchema> & {
  title: LocalizedString;
  description?: LocalizedString;
};
