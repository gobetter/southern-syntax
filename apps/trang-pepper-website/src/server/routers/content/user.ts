import { z } from "zod";

import { router, authorizedProcedure } from "@southern-syntax/trpc";
import {
  PERMISSION_ACTIONS,
  PERMISSION_RESOURCES,
} from "@southern-syntax/auth";
import {
  userCreateSchema,
  userUpdateSchema,
} from "@southern-syntax/schemas/user";
import {
  USER_SORTABLE_FIELDS,
  VALID_USER_STATUSES,
} from "@southern-syntax/types";

import { userService } from "@southern-syntax/domain-admin/user";
import { SORT_ORDERS } from "@southern-syntax/types";

export const userRouter = router({
  /**
   * ดึงผู้ใช้ทั้งหมดพร้อมการแบ่งหน้าและค้นหา
   */
  getAll: authorizedProcedure(
    PERMISSION_RESOURCES.USER,
    PERMISSION_ACTIONS.READ
  )
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(10),
        searchQuery: z.string().optional(),
        status: z.enum(VALID_USER_STATUSES).optional(),
        sortBy: z.enum(USER_SORTABLE_FIELDS).optional(),
        sortOrder: z.enum(SORT_ORDERS).optional(),
        roleId: z.string().uuid().optional(),
      })
    )
    .query(async ({ input }) => {
      // เรียกใช้ service แทนการเรียก prisma โดยตรง
      return userService.getAllUsers(input);
    }),

  /**
   * สร้างผู้ใช้ใหม่
   */
  create: authorizedProcedure(
    PERMISSION_RESOURCES.USER,
    PERMISSION_ACTIONS.CREATE
  )
    .input(userCreateSchema)
    .mutation(async ({ input, ctx }) => {
      // เรียกใช้ service พร้อมส่ง actorId จาก session
      const actorId = ctx.session.user.id;
      return userService.createUser(input, actorId);
    }),

  /**
   * อัปเดตข้อมูลผู้ใช้
   */
  update: authorizedProcedure(
    PERMISSION_RESOURCES.USER,
    PERMISSION_ACTIONS.UPDATE
  )
    .input(
      z.object({
        id: z.string(),
        data: userUpdateSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const actorId = ctx.session.user.id;
      // Filter out empty password string so we don't update it
      const dataToUpdate = { ...input.data };
      if (dataToUpdate.password === "") {
        delete dataToUpdate.password;
      }
      return userService.updateUser(input.id, dataToUpdate, actorId);
    }),

  // Bulk Deactivate
  deactivateMany: authorizedProcedure(
    PERMISSION_RESOURCES.USER,
    PERMISSION_ACTIONS.DELETE
  )
    .input(
      z.object({
        ids: z.array(z.string()).min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const actorId = ctx.session.user.id;
      return userService.deactivateManyUsers(input.ids, actorId);
    }),

  reactivateMany: authorizedProcedure(
    PERMISSION_RESOURCES.USER,
    PERMISSION_ACTIONS.UPDATE
  )
    .input(
      z.object({
        ids: z.array(z.string()).min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const actorId = ctx.session.user.id;
      return userService.reactivateManyUsers(input.ids, actorId);
    }),

  changeRoleMany: authorizedProcedure(
    PERMISSION_RESOURCES.USER,
    PERMISSION_ACTIONS.UPDATE
  )
    .input(
      z.object({
        ids: z.array(z.string()).min(1),
        roleId: z.string().uuid(), // รับ ID ของ Role ใหม่
      })
    )
    .mutation(async ({ input, ctx }) => {
      const actorId = ctx.session.user.id;
      return userService.changeManyUsersRole(input.ids, input.roleId, actorId);
    }),
});
