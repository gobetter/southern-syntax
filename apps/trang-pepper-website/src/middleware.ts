import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, type NextFetchEvent } from "next/server";
import {
  withAuth,
  type NextRequestWithAuth,
  type NextMiddlewareWithAuth,
} from "next-auth/middleware";
import { locales, defaultLocale } from "@southern-syntax/config";

// 1. สร้าง i18n middleware ขึ้นมา
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

// 2. สร้าง Auth middleware โดยใช้ withAuth จาก next-auth
const authMiddleware: NextMiddlewareWithAuth = withAuth(
  // ฟังก์ชันนี้จะถูกเรียกก็ต่อเมื่อ "ผ่าน" การตรวจสอบสิทธิ์แล้ว
  // หน้าที่ของมันคือส่ง request ต่อไปให้ intlMiddleware จัดการเรื่องภาษา
  function middleware(req: NextRequestWithAuth) {
    return intlMiddleware(req);
  },
  {
    // callbacks สำหรับตรวจสอบสิทธิ์
    callbacks: {
      // withAuth จะใช้ token ที่อยู่ใน cookie เพื่อตัดสินใจ
      // ถ้า token มีอยู่ (ไม่เป็น null) ก็ถือว่า authorize ผ่าน
      authorized: ({ token }) => token != null,
    },
    // ถ้า authorize ไม่ผ่าน ให้ redirect ไปที่หน้า sign-in
    // withAuth จะจัดการเรื่อง locale ให้เราเอง
    pages: {
      signIn: "/auth/signin",
    },
  }
);

// 3. Middleware หลักที่จะทำหน้าที่ "ควบคุม"
export default function middleware(req: NextRequest, event: NextFetchEvent) {
  // กำหนด path ที่เป็นสาธารณะ (ไม่ต้องล็อกอิน)
  const publicPathnameRegex = new RegExp(
    `^(/(${locales.join("|")}))?(${["/auth/signin", "/auth/register"].join("|")}|/)?$`,
    "i"
  );
  const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);

  if (isPublicPage) {
    // ถ้าเป็นหน้าสาธารณะ ให้ใช้แค่ i18n middleware
    return intlMiddleware(req);
  } else {
    // ถ้าเป็นหน้าที่ต้องป้องกัน (เช่น /admin) ให้ใช้ auth middleware
    // withAuth expects `NextRequestWithAuth`, so cast accordingly
    return authMiddleware(req as unknown as NextRequestWithAuth, event);
  }
}

export const config = {
  // เราจะใช้ matcher ที่ครอบคลุมมากขึ้น และให้ logic ข้างบนจัดการเอง
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};

/* OLD - WORKING

import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from '../next-intl.config';

// สร้าง handler ของ next-intl ไว้ข้างนอก
const handleI18nRouting = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- ส่วนป้องกันหน้า Admin ---
  // 1. ตรวจสอบว่า path เริ่มต้นด้วย /admin หรือไม่
  const isAdminPath = pathname.split('/')[2] === 'admin';

  if (isAdminPath) {
    // 2. ถ้าเป็นหน้า admin, ให้ตรวจสอบ session โดยตรงที่นี่!
    // เราไม่สามารถใช้ getServerSession ใน middleware ได้ แต่เราสามารถเช็ค cookie ได้โดยตรง
    const sessionCookie =
      request.cookies.get('next-auth.session-token') ||
      request.cookies.get('__Secure-next-auth.session-token');

    // 3. ถ้าไม่มี cookie, redirect ไปหน้า sign-in ทันที
    if (!sessionCookie) {
      const locale = pathname.split('/')[1] || defaultLocale;
      const callbackUrl = request.nextUrl.pathname;
      const signInUrl = new URL(`/${locale}/auth/signin`, request.url);
      signInUrl.searchParams.set('callbackUrl', callbackUrl);
      return NextResponse.redirect(signInUrl);
    }
  }
  // --- จบส่วนป้องกันหน้า Admin ---

  // 4. หลังจากจัดการส่วน admin แล้ว ให้ i18n middleware ทำงานตามปกติ
  return handleI18nRouting(request);
}

export const config = {
  // เราจะใช้ matcher ที่ครอบคลุมมากขึ้น และให้ logic ข้างบนจัดการเอง
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
*/
