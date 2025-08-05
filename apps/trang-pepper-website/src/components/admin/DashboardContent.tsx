// src/components/admin/DashboardContent.tsx
"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@southern-syntax/ui/card";
import { getLocalizedString } from "@/i18n/utils";
import { PERMISSION_ACTIONS, PERMISSION_RESOURCES } from "@/lib/auth/constants";
import { can } from "@/lib/auth";
import { useSession } from "next-auth/react";

const dashboardCards = [
  {
    href: "/admin/users",
    titleKey: "user_management.title",
    descriptionKey: "user_management.description",
    resource: PERMISSION_RESOURCES.USER,
  },
  {
    href: "/admin/roles",
    titleKey: "role_management.title", // เพิ่มคีย์ใหม่
    descriptionKey: "role_management.description", // เพิ่มคีย์ใหม่
    resource: PERMISSION_RESOURCES.ROLE,
  },
  {
    href: "/admin/media",
    titleKey: "media_library.title",
    descriptionKey: "media_library.description",
    resource: PERMISSION_RESOURCES.MEDIA,
  },
  {
    href: "/admin/media-taxonomy",
    titleKey: "content_management.title",
    descriptionKey: "content_management.description",
    resource: PERMISSION_RESOURCES.MEDIA_TAXONOMY,
  },
  {
    href: "/admin/audit-log",
    titleKey: "audit_log.title",
    descriptionKey: "audit_log.description",
    resource: PERMISSION_RESOURCES.AUDIT_LOG,
  },
];

export default function DashboardContent() {
  const t_dashboard = useTranslations("admin_dashboard");
  const t_common = useTranslations("common");
  const locale = useLocale();
  const { data: session } = useSession();

  const displayName = session?.user?.name
    ? getLocalizedString(session.user.name, locale) || session.user.email
    : "";

  const welcomeMessage = t_common("general.welcome");
  const fullWelcomeMessage = `${welcomeMessage}, ${displayName}!`;

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-lg">{fullWelcomeMessage}</p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* ✅ 4. ใช้ .map() และ can() เพื่อสร้าง Card แบบไดนามิก */}
        {dashboardCards.map((card) => {
          const hasAccess = can(
            session,
            card.resource,
            PERMISSION_ACTIONS.READ
          );

          if (!hasAccess) {
            return null; // ถ้าไม่มีสิทธิ์ ก็ไม่ต้องแสดง Card นี้
          }

          return (
            <Link key={card.href} href={`/${locale}${card.href}`}>
              <Card className="hover:border-primary h-full transition-all hover:shadow-md">
                <CardHeader>
                  <CardTitle>{t_dashboard(card.titleKey)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{t_dashboard(card.descriptionKey)}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
