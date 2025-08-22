import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import DashboardContent from "@/components/admin/dashboard-content";
import ErrorBoundary from "@/components/common/error-boundary";
import Spinner from "@/components/common/spinner";

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  const t = await getTranslations({ locale: lang, namespace: "common" });

  return (
    <div className="p-4 md:p-6">
      <h1 className="mb-4 text-3xl font-bold">{t("navigation.dashboard")}</h1>

      <ErrorBoundary>
        <Suspense fallback={<Spinner />}>
          <DashboardContent />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
