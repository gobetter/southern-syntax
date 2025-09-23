import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

// ✅ ใช้ config ของแอปเอง (ไฟล์ next-intl.config.ts ด้านล่าง)
const withNextIntl = createNextIntlPlugin("./next-intl.config.ts");

const nextConfig: NextConfig = {
  transpilePackages: [
    "@southern-syntax/auth",
    "@southern-syntax/config",
    "@southern-syntax/db",
    "@southern-syntax/hooks",
    "@southern-syntax/hooks-next",
    "@southern-syntax/i18n",
    "@southern-syntax/schemas",
    "@southern-syntax/services",
    "@southern-syntax/types",
    "@southern-syntax/ui",
    "@southern-syntax/utils",
    "@southern-syntax/utils-server",
    "@southern-syntax/utils-client",
  ],
};

export default withNextIntl(nextConfig);
