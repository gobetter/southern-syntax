// apps/trang-pepper-website/next-intl.config.ts
import { getRequestConfig } from "next-intl/server";
import { locales, defaultLocale } from "@southern-syntax/config";

// โหลดข้อความแบบชัดเจน
const loaders = {
  en: () => import("@southern-syntax/i18n/messages/en"),
  th: () => import("@southern-syntax/i18n/messages/th"),
} as const;
type Locale = keyof typeof loaders;

export default getRequestConfig(async ({ locale }) => {
  // หลีกเลี่ยง notFound() ใน config — ใช้ fallback แทน
  const l =
    locale && (["en", "th"] as string[]).includes(locale)
      ? (locale as Locale)
      : (defaultLocale as Locale);

  const mod = await loaders[l]();
  return {
    locale: l,
    messages: mod.default,
  };
});
