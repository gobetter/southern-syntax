// src/lib/trpc-provider.tsx
'use client'; // ต้องเป็น Client Component

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client'; // สำหรับการเชื่อมต่อ HTTP

import { trpc } from './trpc-client';

interface TRPCProviderProps {
  children: ReactNode;
}

export default function TRPCProvider({ children }: TRPCProviderProps) {
  // สร้าง QueryClient สำหรับ React Query (จัดการ Caching, Deduping, etc.)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        // ตั้งค่า default options สำหรับ React Query (ตัวอย่าง)
        defaultOptions: {
          queries: {
            staleTime: 5 * 1000, // 5 วินาที
            refetchOnWindowFocus: false, // ไม่ต้อง refetch เมื่อกลับมาที่หน้าต่าง
          },
        },
      }),
  );

  // สร้าง tRPC Client
  const [trpcClient] = useState(() =>
    trpc.createClient({
      // Links: กำหนดวิธีการสื่อสารของ tRPC
      links: [
        httpBatchLink({
          url: '/api/trpc', // URL ของ tRPC API Endpoint
        }),
      ],
    }),
  );

  return (
    // ห่อหุ้ม children ด้วย tRPC Provider และ React Query Provider
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
