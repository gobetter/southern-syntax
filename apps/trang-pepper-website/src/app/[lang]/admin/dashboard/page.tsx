// src/app/[lang]/admin/dashboard/page.tsx
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

import DashboardContent from '@/components/admin/DashboardContent';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import Spinner from '@/components/common/Spinner';

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  const t = await getTranslations({ locale: lang, namespace: 'common' });

  return (
    <div className="p-4 md:p-6">
      <h1 className="mb-4 text-3xl font-bold">{t('navigation.dashboard')}</h1>

      <ErrorBoundary>
        <Suspense fallback={<Spinner />}>
          <DashboardContent />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
