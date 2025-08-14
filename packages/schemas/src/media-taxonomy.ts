import { z } from "zod";
import { localizedStringSchema } from "./media"; // Import schema ที่เรามีอยู่แล้ว

// Schema สำหรับการสร้างหรือแก้ไข Media Category
export const mediaCategoryInputSchema = z
  .object({
    name: localizedStringSchema,
    slug: z
      .string()
      .min(3, "error_slug_min_length")
      .regex(/^[a-z0-9-]+$/, "error_slug_invalid_chars"),
  })
  .refine((data) => data.name?.en && data.name.en.trim().length > 0, {
    message: "error_field_is_required",
    path: ["name", "en"],
  })
  .refine((data) => data.name?.th && data.name.th.trim().length > 0, {
    message: "error_field_is_required",
    path: ["name", "th"],
  });

export type MediaCategoryInput = z.infer<typeof mediaCategoryInputSchema>;

// Schema สำหรับการสร้างหรือแก้ไข Media Tag
export const mediaTagInputSchema = z
  .object({
    name: localizedStringSchema,
    slug: z
      .string()
      .min(2, "error_slug_min_length")
      .regex(/^[a-z0-9-]+$/, "error_slug_invalid_chars"),
  })
  .refine((data) => data.name?.en && data.name.en.trim().length > 0, {
    message: "error_field_is_required",
    path: ["name", "en"],
  })
  .refine((data) => data.name?.th && data.name.th.trim().length > 0, {
    message: "error_field_is_required",
    path: ["name", "th"],
  });

export type MediaTagInput = z.infer<typeof mediaTagInputSchema>;
