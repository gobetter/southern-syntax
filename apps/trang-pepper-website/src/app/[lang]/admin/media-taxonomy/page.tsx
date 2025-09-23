import { PERMISSION_RESOURCES } from "@southern-syntax/rbac";
import { Suspense } from "react";
import MediaTaxonomyClient from "@/components/admin/media-taxonomy/media-taxonomy-client";
import ErrorBoundary from "@/components/common/error-boundary";
import ProtectedPage from "@/components/auth/protected-page";
import Spinner from "@/components/common/spinner";

export default async function MediaTaxonomyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return (
    <ProtectedPage
      lang={lang}
      resource={PERMISSION_RESOURCES.MEDIA_TAXONOMY}
      callbackUrl="/admin/media-taxonomy"
    >
      <div className="container mx-auto p-4 md:p-6">
        <ErrorBoundary>
          <Suspense fallback={<Spinner className="mx-auto h-8 w-8" />}>
            <MediaTaxonomyClient />
          </Suspense>
        </ErrorBoundary>
      </div>
    </ProtectedPage>
  );
}
