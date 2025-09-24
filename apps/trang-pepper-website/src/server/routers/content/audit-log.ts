import { z } from "zod";
import { auditLogService } from "@southern-syntax/domain-admin/audit-log";
import { TRPCError } from "@trpc/server";
import { router, authorizedProcedure, PERMISSION_ACTIONS, PERMISSION_RESOURCES, ROLE_NAMES } from "@southern-syntax/trpc";

export const auditLogRouter = router({
  getAll: authorizedProcedure(
    PERMISSION_RESOURCES.SETTINGS, // สมมติว่าการดู Log เป็นส่วนหนึ่งของ Settings
    PERMISSION_ACTIONS.READ
  )
    // เพิ่ม Middleware อีกชั้นเพื่อเช็คว่าเป็น SUPERADMIN เท่านั้น
    .use(async ({ ctx, next }) => {
      if (ctx.session.user.role !== ROLE_NAMES.SUPERADMIN) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only Super Admins can access audit logs.",
        });
      }
      return next();
    })
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(25),
      })
    )
    .query(async ({ input }) => {
      return auditLogService.getAllLogs(input);
    }),
});
