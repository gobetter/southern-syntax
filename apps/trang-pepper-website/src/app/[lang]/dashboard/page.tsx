import { Suspense } from "react";
// import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

// import { authOptions } from "@southern-syntax/auth/server";
import { getServerAuthSession } from "@southern-syntax/auth/server";

import DashboardContent from "@/components/admin/dashboard-content";
import UserInfo from "@/components/user/user-info";
import ErrorBoundary from "@/components/common/error-boundary";
import Spinner from "@/components/common/spinner";
import { ROLE_NAMES } from "@southern-syntax/rbac";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  // const session = await getServerSession(authOptions);
  const session = await getServerAuthSession();

  if (!session) {
    redirect(`/${lang}/auth/signin`);
  }

  const t = await getTranslations({ locale: lang, namespace: "common" });

  return (
    <div className="p-4 md:p-6">
      <h1 className="mb-4 text-3xl font-bold">{t("navigation.dashboard")}</h1>

      <UserInfo user={session.user!} />

      {/* เงื่อนไขนี้ควรจะตรวจสอบ Role ที่มีสิทธิ์เข้าถึง Admin Dashboard ไม่ใช่แค่ 'ADMIN' */}
      {(session.user?.role === ROLE_NAMES.ADMIN ||
        session.user?.role === ROLE_NAMES.SUPERADMIN) && (
        <ErrorBoundary>
          <Suspense fallback={<Spinner />}>
            <DashboardContent />
          </Suspense>
        </ErrorBoundary>
      )}
    </div>
  );
}
