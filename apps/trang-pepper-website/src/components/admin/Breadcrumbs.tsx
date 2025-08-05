"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";

import { cn } from "@southern-syntax/ui/lib/utils";

export default function Breadcrumbs() {
  const t = useTranslations("admin_navigation");
  const pathname = usePathname();
  const locale = useLocale();

  // สร้าง array ของ path segments จาก URL
  const segments = pathname.split("/").filter(Boolean).slice(1); // ตัด [lang] ออก

  return (
    <nav className="text-muted-foreground mb-4 flex items-center space-x-2 text-sm">
      <Link href={`/${locale}/admin/dashboard`} className="hover:text-primary">
        {t("dashboard")}
      </Link>
      {segments.map((segment, index) => {
        const href = `/${locale}/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;

        return (
          <Fragment key={href}>
            <ChevronRight className="h-4 w-4" />
            <Link
              href={href}
              className={cn(
                "capitalize",
                isLast ? "text-foreground font-semibold" : "hover:text-primary"
              )}
            >
              {t(segment.replace("-", "_"))}
            </Link>
          </Fragment>
        );
      })}
    </nav>
  );
}
