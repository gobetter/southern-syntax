// src/app/[lang]/admin/media-taxonomy/page.tsx
import { Suspense } from 'react';

import { PERMISSION_RESOURCES } from '@/lib/auth/constants';

import MediaTaxonomyClient from '@/components/admin/media-taxonomy/MediaTaxonomyClient';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import ProtectedPage from '@/components/auth/ProtectedPage';
import Spinner from '@/components/common/Spinner';

export default async function MediaTaxonomyPage({ params }: { params: Promise<{ lang: string }> }) {
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
