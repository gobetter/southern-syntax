// src/schemas/media.ts
import { z } from "zod";
import { LocalizedStringSchema } from "./i18n";

// 1. สร้าง Schema กลางสำหรับ LocalizedString เพื่อใช้ซ้ำ
export const localizedStringSchema = z.record(z.string(), z.string());

// 2. Schema สำหรับข้อมูล Metadata ที่จะบันทึกลง DB หรือส่งผ่าน API
//    (จะไม่มี buffer ซึ่งไม่สามารถ serialize ผ่าน JSON ได้)
export const mediaMetadataSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
  mimeType: z.string().min(1, "Mime type is required"),
  fileSize: z.number().int().positive("File size must be positive"),
  title: LocalizedStringSchema,
  altText: localizedStringSchema.optional(),
  caption: localizedStringSchema.optional(),
});

// 3. สร้าง Input Type สำหรับฟังก์ชัน upload ใน Service Layer
//    โดยการรวม Metadata เข้ากับ Buffer และ UserId
export type MediaUploadInput = z.infer<typeof mediaMetadataSchema> & {
  buffer: Buffer;
  userId: string;
};

// 4. Schema สำหรับการอัปเดตข้อมูล (เฉพาะส่วนที่แก้ไขได้)
export const mediaUpdateFormInputSchema = z.object({
  title: localizedStringSchema.optional(),
  altText: localizedStringSchema.optional(),
  caption: localizedStringSchema.optional(),
  categoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(), // Array ของ ID
});
export type MediaUpdateFormInput = z.infer<typeof mediaUpdateFormInputSchema>;
