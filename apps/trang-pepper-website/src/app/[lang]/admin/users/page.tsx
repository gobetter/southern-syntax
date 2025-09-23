import { PERMISSION_RESOURCES } from "@southern-syntax/rbac";
import { Suspense } from "react";
import UserManagementClient from "@/components/admin/users/user-management-client";
import ProtectedPage from "@/components/auth/protected-page";
import ErrorBoundary from "@/components/common/error-boundary";
import Spinner from "@/components/common/spinner";

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
