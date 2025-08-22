import { Suspense } from "react";

import { PERMISSION_RESOURCES } from "@southern-syntax/auth";

import ProtectedPage from "@/components/auth/protected-page";
import RoleManagerClient from "@/components/admin/roles/role-manager-client";
import ErrorBoundary from "@/components/common/error-boundary";
import Spinner from "@/components/common/spinner";

export default async function RoleManagementPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return (
    <ProtectedPage
      lang={lang}
      resource={PERMISSION_RESOURCES.ROLE}
      callbackUrl="/admin/roles"
    >
      <div className="container mx-auto p-4 md:p-6">
        <ErrorBoundary>
          <Suspense fallback={<Spinner className="mx-auto h-8 w-8" />}>
            <RoleManagerClient />
          </Suspense>
        </ErrorBoundary>
      </div>
    </ProtectedPage>
  );
}
