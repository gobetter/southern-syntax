import { z } from "zod";

export const languageInputSchema = z.object({
  code: z
    .string()
    .min(2, "Language code must be at least 2 characters")
    .max(5, "Language code cannot exceed 5 characters"),
  name: z.string().min(1, "Language name is required"),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export type LanguageInput = z.infer<typeof languageInputSchema>;
