/*
ไฟล์นี้มีหน้าที่รับผิดชอบเพียงอย่างเดียวและเป็นหน้าที่ที่สำคัญมากคือ: การสร้าง "พิมพ์เขียว" (Blueprint) สำหรับการตรวจสอบข้อมูลที่เป็น "ข้อความหลายภาษา" (Localized String) เท่านั้น
พูดง่ายๆ คือ Schema ในไฟล์นี้จะถูกนำไปใช้กับฟิลด์ที่เราได้ออกแบบไว้ใน Prisma Schema ให้เป็น Json เพื่อเก็บข้อมูลเช่น:
  - name: { "en": "User Name", "th": "ชื่อผู้ใช้" }
  - title: { "en": "Product Title", "th": "ชื่อสินค้า" }
  - description: { "en": "Description", "th": "คำอธิบาย" }
*/

import { z } from "zod";
// import { locales } from "../../next-intl.config";
import { locales } from "@southern-syntax/i18n/constants";

// Schema พื้นฐาน: object ที่มี key เป็นภาษาที่เรารองรับ และ value เป็น string
export const LocalizedStringSchema = z
  .object(
    Object.fromEntries(locales.map((locale) => [locale, z.string()])) as {
      [key in (typeof locales)[number]]: z.ZodString;
    }
  )
  .partial(); // .partial() ทำให้ทุก key เป็น optional
