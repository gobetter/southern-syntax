// src/server/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import { getServerSession } from "next-auth"; // สำหรับดึง Session ใน context
import { authOptions, can } from "@southern-syntax/auth"; // authOptions และ can function

import prisma from "@southern-syntax/db"; // Prisma Client instance
import {
  PermissionActionType,
  PermissionResourceType,
} from "@southern-syntax/auth"; // นำเข้า Type ที่ถูกต้อง

// สร้าง Context สำหรับ tRPC
// Context จะมีข้อมูลที่เข้าถึงได้ในทุก tRPC procedure (เช่น session, prisma client)
export const createTRPCContext = async () => {
  const session = await getServerSession(authOptions); // ดึง NextAuth.js session
  return {
    session, // ส่ง session เข้าไปใน context
    prisma, // ส่ง prisma client เข้าไปใน context
  };
};

// Initialize tRPC
// .context<typeof createTRPCContext>() เพื่อให้ tRPC รู้จัก Type ของ context ที่เราสร้าง
const t = initTRPC.context<typeof createTRPCContext>().create();

// สร้าง Reusable middleware และ Procedure Builders
export const router = t.router;
// publicProcedure: สำหรับ API ที่ใครก็เรียกได้ (ไม่ต้อง Login)
export const publicProcedure = t.procedure;

// protectedProcedure: สำหรับ API ที่ต้อง Login แล้วเท่านั้น
export const protectedProcedure = t.procedure.use(
  t.middleware(({ ctx, next }) => {
    // ตรวจสอบว่ามี session และ user ใน session หรือไม่
    if (!ctx.session || !ctx.session.user) {
      // ถ้าไม่มี session, โยน Error Unauthorized
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    // ถ้ามี session, ส่ง session นั้นต่อไปใน context ของ procedure ถัดไป
    return next({
      ctx: {
        session: ctx.session,
      },
    });
  })
);

// authorizedProcedure: สำหรับ API ที่ต้อง Login แล้วและมีสิทธิ์ตามที่กำหนด
// แก้ไข Type ของ resource และ action ให้เป็น Type ที่ถูกต้องจาก constants
export const authorizedProcedure = (
  resource: PermissionResourceType,
  action: PermissionActionType
) => {
  return protectedProcedure.use(
    t.middleware(async ({ ctx, next }) => {
      // ใช้ can function จาก src/lib/auth/utils.ts เพื่อตรวจสอบสิทธิ์
      // ตอนนี้ไม่จำเป็นต้องใช้ Type Assertion (as any) แล้ว
      const hasPermission = await can(ctx.session, resource, action);

      // ถ้าไม่มีสิทธิ์, โยน Error Forbidden
      if (!hasPermission) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      // ถ้ามีสิทธิ์, ดำเนินการต่อ
      return next();
    })
  );
};
