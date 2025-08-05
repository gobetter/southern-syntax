import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@southern-syntax/i18n";

type Locale = (typeof locales)[number];

// This type guard remains the same.
// function isValidLocale(locale: string): locale is Locale {
//   return (locales as readonly string[]).includes(locale);
// }

function isValidLocale(locale: any): locale is Locale {
  return locales.includes(locale);
}

export default getRequestConfig(async ({ locale }) => {
  // 1. First, check if a locale is provided at all.
  // 2. If it is, then validate it with our type guard.
  // This two-step check ensures we never pass `undefined` to `isValidLocale`.
  if (!locale || !isValidLocale(locale)) {
    notFound();
  }

  return {
    locale, // At this point, TypeScript knows `locale` is of type `Locale`.
    messages: (await import(`@southern-syntax/i18n/${locale}`)).default,
  };
});

// export default getRequestConfig(async ({ locale }) => {
//   if (!isValidLocale(locale)) {
//     notFound();
//   }

//   return {
//     // ✅ แก้ไข Path ให้ import มาจาก package ส่วนกลาง
//     messages: (await import(`@southern-syntax/i18n/${locale}`)).default,
//   };
// });

/*

// next-intl.config.ts
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['en', 'th'] as const; // Add 'as const' for stricter typing
export const defaultLocale = 'th';

type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  // Type guard to validate the locale
  if (typeof locale !== 'string') notFound();
  const isValidLocale = (locales as readonly string[]).includes(locale);
  if (!isValidLocale) notFound();

  return {
    // 1. Add the locale property back in
    locale: locale as Locale,
    // 2. Load the messages dynamically
    messages: (await import(`./messages/${locale}.ts`)).default,
  };
});
*/
