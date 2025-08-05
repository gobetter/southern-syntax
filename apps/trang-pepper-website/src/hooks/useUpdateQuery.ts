// src/hooks/useUpdateQuery.ts
'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function useUpdateQuery() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  return useCallback(
    (params: Record<string, string | number | null>) => {
      const query = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(params)) {
        if (value === null || value === '') {
          query.delete(key);
        } else {
          query.set(key, String(value));
        }
      }

      router.push(`${pathname}?${query.toString()}`);
    },
    [pathname, router, searchParams],
  );
}
