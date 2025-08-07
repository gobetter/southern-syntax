// src/hooks/useToast.ts
'use client';

import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export function useToast() {
  const t = useTranslations('common.toast');

  const show = {
    success: (message?: string) => {
      toast.success(t('success_title'), {
        description: message || t('success_description'),
      });
    },
    error: (message?: string) => {
      toast.error(t('error_title'), {
        description: message || t('error_description'),
      });
    },
  };

  return show;
}
