// apps/trang-pepper-website/src/app/[lang]/admin/audit-log/page.tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";

import { authOptions, can } from "@southern-syntax/auth/server";
import {
  PERMISSION_ACTIONS,
  PERMISSION_RESOURCES,
  ROLE_NAMES,
} from "@southern-syntax/auth";

import AuditLogClient from "@/components/admin/audit-log/AuditLogClient";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import Spinner from "@/components/common/Spinner";
import AccessDenied from "@/components/auth/AccessDenied";

export default async function AuditLogPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(`/${lang}/auth/signin?callbackUrl=/admin/audit-log`);
  }

  // เพิ่ม "ด่านตรวจสอบสิทธิ์" ที่เฉพาะเจาะจงสำหรับหน้านี้
  // เราจะใช้ can() และตรวจสอบ Role โดยตรงเพื่อให้แน่ใจ
  const hasAccess =
    session.user.role === ROLE_NAMES.SUPERADMIN &&
    can(session, PERMISSION_RESOURCES.AUDIT_LOG, PERMISSION_ACTIONS.READ);

  if (!hasAccess) {
    // ถ้าไม่มีสิทธิ์, ให้แสดง AccessDenied ทันที
    return <AccessDenied />;
  }

  const t = await getTranslations({
    locale: lang,
    namespace: "admin_audit_log",
  });
  const pageTitle = t("title");

  // เราไม่ใช้ ProtectedPage ที่นี่เพราะเราอนุญาตให้เฉพาะ Super Admin เข้าถึงเท่านั้น
  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="mb-4 text-3xl font-bold">{pageTitle}</h1>
      <ErrorBoundary>
        <Suspense fallback={<Spinner className="mx-auto h-8 w-8" />}>
          <AuditLogClient />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
