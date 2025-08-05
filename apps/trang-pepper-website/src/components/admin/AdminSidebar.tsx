"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Image as ImageIcon,
  BookCopy,
  ShieldCheck,
  Shield,
} from "lucide-react";

import { can } from "@/lib/auth";
import { cn } from "@southern-syntax/ui/lib/utils";
import { PERMISSION_ACTIONS, PERMISSION_RESOURCES } from "@/lib/auth/constants";

// ✅ 1. จัดลำดับใหม่: นำ path ที่ยาวกว่า (เจาะจงกว่า) ขึ้นก่อน
const sidebarNavItems = [
  {
    titleKey: "dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    resource: PERMISSION_RESOURCES.ADMIN_DASHBOARD,
  },
  {
    titleKey: "users",
    href: "/admin/users",
    icon: Users,
    resource: PERMISSION_RESOURCES.USER,
  },
  {
    titleKey: "roles",
    href: "/admin/roles",
    icon: Shield,
    resource: PERMISSION_RESOURCES.ROLE,
  },
  {
    titleKey: "media",
    href: "/admin/media",
    icon: ImageIcon,
    resource: PERMISSION_RESOURCES.MEDIA,
  },
  {
    titleKey: "taxonomies",
    href: "/admin/media-taxonomy",
    icon: BookCopy,
    resource: PERMISSION_RESOURCES.MEDIA_TAXONOMY,
  },
  {
    titleKey: "audit_log",
    href: "/admin/audit-log",
    icon: ShieldCheck,
    resource: PERMISSION_RESOURCES.AUDIT_LOG,
  },
];

export default function AdminSidebar() {
  const t = useTranslations("admin_navigation");
  const locale = useLocale();
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="bg-background hidden w-64 flex-col border-r p-4 md:flex">
      <nav className="flex flex-col space-y-2">
        {sidebarNavItems.map((item) => {
          // ✅ 6. ตรวจสอบสิทธิ์ก่อน Render เมนู
          const hasAccess = can(
            session,
            item.resource,
            PERMISSION_ACTIONS.READ
          );

          if (!hasAccess) {
            return null; // ถ้าไม่มีสิทธิ์ ก็ไม่ต้องแสดงผลเมนูนี้
          }

          const itemPath = `/${locale}${item.href}`;
          const isActive =
            pathname === itemPath || pathname.startsWith(`${itemPath}/`);

          return (
            <Link
              key={item.href}
              href={itemPath}
              className={cn(
                "hover:bg-muted flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-muted text-primary font-semibold"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              <span>{t(item.titleKey)}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
