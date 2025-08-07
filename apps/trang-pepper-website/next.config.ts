import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("../../packages/i18n/request.ts");

const nextConfig: NextConfig = {
  // ระบุ packages ที่ต้องการให้ Next.js transpile จาก TypeScript ภายใน monorepo
  transpilePackages: [
    "@southern-syntax/ui",
    "@southern-syntax/utils",
    "@southern-syntax/schemas",
    "@southern-syntax/types",
    "@southern-syntax/auth",
    "@southern-syntax/db",
    "@southern-syntax/i18n",
  ],

  // สามารถเพิ่มการตั้งค่า Next.js อื่นๆ ของคุณที่นี่
  // reactStrictMode: true,
  // swcMinify: true,
  // compiler: {
  //   removeConsole: process.env.NODE_ENV === 'production',
  // },
  // images: {
  //   domains: ['your-supabase-storage-url.supabase.co'], // สำหรับ Supabase Storage URLs
  // },
  // output: 'standalone',
};

export default withNextIntl(nextConfig);
