import { Suspense } from "react";

import { PERMISSION_RESOURCES } from "@southern-syntax/auth";

import UserManagementClient from "@/components/admin/users/UserManagementClient";
import ProtectedPage from "@/components/auth/ProtectedPage";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import Spinner from "@/components/common/Spinner";

export default async function UserManagementPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return (
    <ProtectedPage
      lang={lang}
      resource={PERMISSION_RESOURCES.USER}
      callbackUrl="/admin/users"
    >
      <div className="container mx-auto p-4 md:p-6">
        <ErrorBoundary>
          <Suspense fallback={<Spinner className="mx-auto h-8 w-8" />}>
            <UserManagementClient />
          </Suspense>
        </ErrorBoundary>
      </div>
    </ProtectedPage>
  );
}
