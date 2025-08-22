import { Suspense } from "react";

import { PERMISSION_RESOURCES } from "@southern-syntax/auth";

import MediaLibraryClient from "@/components/admin/media/media-library-client";
import ErrorBoundary from "@/components/common/error-boundary";
import Spinner from "@/components/common/spinner";
import ProtectedPage from "@/components/auth/protected-page";

export default async function MediaLibraryPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return (
    <ProtectedPage
      lang={lang}
      resource={PERMISSION_RESOURCES.MEDIA}
      callbackUrl="/admin/media"
    >
      <div className="container mx-auto p-4 md:p-6">
        <ErrorBoundary>
          <Suspense fallback={<Spinner className="mx-auto h-8 w-8" />}>
            <MediaLibraryClient />
          </Suspense>
        </ErrorBoundary>
      </div>
    </ProtectedPage>
  );
}
