// apps/trang-pepper-website/next-intl.config.ts
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@southern-syntax/config";

// แผนที่ locale -> โมดูลข้อความ (literal imports เพื่อให้ bundler เก็บไฟล์ถูกต้อง)
const loaders = {
  en: () => import("@southern-syntax/i18n/messages/en"),
  th: () => import("@southern-syntax/i18n/messages/th"),
} as const;

type Locale = keyof typeof loaders;

export default getRequestConfig(async ({ locale }) => {
  // ใช้ locales จาก config เพื่อตรวจสอบให้ชัวร์ว่าภาษาอยู่ใน allowlist
  if (!locale || !locales.includes(locale as Locale)) {
    notFound();
  }

  const l = locale as Locale;
  return {
    locale: l,
    messages: (await loaders[l]()).default,
  };
});
