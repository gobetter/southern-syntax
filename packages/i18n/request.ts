import { getRequestConfig } from "next-intl/server";
import { locales, defaultLocale } from "./constants";

export default getRequestConfig(async ({ locale }) => {
  // ใช้ .find() เพื่อหา locale ที่ตรงกัน, ถ้าไม่เจอให้ใช้ defaultLocale
  // วิธีนี้จะทำให้ TypeScript มั่นใจว่าผลลัพธ์เป็น string เสมอ
  const safeLocale = locales.find((cur) => cur === locale) || defaultLocale;

  return {
    locale: safeLocale,
    messages: (await import(`./messages/${safeLocale}.ts`)).default,
  };
});
