// apps/trang-pepper-website/src/components/admin/DashboardContent.tsx
"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useSession } from "next-auth/react";

import { Card, CardTitle, CardContent } from "@southern-syntax/ui";
import { getLocalizedString } from "@southern-syntax/i18n";
import {
  PERMISSION_ACTIONS,
  PERMISSION_RESOURCES,
  can,
} from "@southern-syntax/auth";

import {
  Users,
  Shield,
  Image as ImageIcon,
  Tags,
  ClipboardList,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

type CardDef = {
  href: string;
  titleKey: string;
  descriptionKey: string;
  resource: (typeof PERMISSION_RESOURCES)[keyof typeof PERMISSION_RESOURCES];
  icon: LucideIcon;
};

const dashboardCards: CardDef[] = [
  {
    href: "/admin/users",
    titleKey: "user_management.title",
    descriptionKey: "user_management.description",
    resource: PERMISSION_RESOURCES.USER,
    icon: Users,
  },
  {
    href: "/admin/roles",
    titleKey: "role_management.title",
    descriptionKey: "role_management.description",
    resource: PERMISSION_RESOURCES.ROLE,
    icon: Shield,
  },
  {
    href: "/admin/media",
    titleKey: "media_library.title",
    descriptionKey: "media_library.description",
    resource: PERMISSION_RESOURCES.MEDIA,
    icon: ImageIcon,
  },
  {
    href: "/admin/media-taxonomy",
    titleKey: "content_management.title",
    descriptionKey: "content_management.description",
    resource: PERMISSION_RESOURCES.MEDIA_TAXONOMY,
    icon: Tags,
  },
  {
    href: "/admin/audit-log",
    titleKey: "audit_log.title",
    descriptionKey: "audit_log.description",
    resource: PERMISSION_RESOURCES.AUDIT_LOG,
    icon: ClipboardList,
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

  const fullWelcomeMessage = `${t_common("general.welcome")}, ${displayName}!`;

  return (
    <div className="space-y-6">
      <p className="text-lg text-muted-foreground">{fullWelcomeMessage}</p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {dashboardCards.map((card) => {
          if (!can(session, card.resource, PERMISSION_ACTIONS.READ))
            return null;

          const Icon = card.icon;

          return (
            <Link
              key={card.href}
              href={`/${locale}${card.href}`}
              className="group focus:outline-none"
              aria-label={t_dashboard(card.titleKey)}
              title={t_dashboard(card.titleKey)}
            >
              <Card
                className={[
                  "relative h-full overflow-hidden border border-border/60",
                  "bg-gradient-to-b from-muted/30 to-background",
                  "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg",
                  "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
                  "min-h-[140px]",
                ].join(" ")}
              >
                {/* header แบบ custom ให้เว้นขอบบน-ล่างอย่างพอดี */}
                <div className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                      <Icon className="h-5 w-5" />
                    </span>
                    <CardTitle className="text-base font-semibold leading-none">
                      {t_dashboard(card.titleKey)}
                    </CardTitle>
                  </div>

                  {/* ลูกศร = สื่อว่าเป็นลิงก์ไปหน้าถัดไป */}
                  <ChevronRight
                    // className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1"
                    className="h-5 w-5 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </div>

                <CardContent className="px-5 pb-5 pt-0">
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {t_dashboard(card.descriptionKey)}
                  </p>
                </CardContent>

                {/* เส้นเน้นด้านล่างเวลาฮอฟเวอร์ */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 scale-x-0 bg-primary/60 transition-transform duration-200 group-hover:scale-x-100" />
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
