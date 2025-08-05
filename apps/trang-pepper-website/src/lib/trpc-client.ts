// src/lib/trpc-client.ts
'use client'; // ต้องเป็น Client Component เพื่อใช้ React Hooks

import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/server/routers/_app'; // Import Type ของ AppRouter จาก Backend

// สร้าง tRPC Client สำหรับ React Components
// Type AppRouter จะช่วยให้ได้ Type Safety และ Autocompletion
export const trpc = createTRPCReact<AppRouter>();
