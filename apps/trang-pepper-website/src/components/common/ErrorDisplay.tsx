// src/components/admin/media/MediaLibraryClient/ErrorDisplay.tsx
'use client';

import { useTranslations } from 'next-intl';

export default function ErrorDisplay({ message }: { message: string }) {
  const t = useTranslations('common');

  return (
    <div className="p-4 text-center text-red-500">
      <p>{t('errors.error_loading_data')}</p>
      <p className="text-sm">{message}</p>
    </div>
  );
}
