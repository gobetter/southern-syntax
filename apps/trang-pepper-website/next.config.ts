// apps/trang-pepper-website/next.config.ts
import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("../../packages/i18n/request.ts");

const nextConfig: NextConfig = {
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
