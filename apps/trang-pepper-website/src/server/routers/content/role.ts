// src/server/routers/content/role.ts
import { z } from 'zod';

import { router, authorizedProcedure } from '@/server/trpc';
import { PERMISSION_RESOURCES, PERMISSION_ACTIONS } from '@/lib/auth/constants';
import { roleService } from '@/services/role';
import { roleSchema } from '@/lib/auth/schemas';
import { idParamSchema } from '@/schemas/common';

export const roleRouter = router({
  getAll: authorizedProcedure(PERMISSION_RESOURCES.ROLE, PERMISSION_ACTIONS.READ).query(
    async () => {
      return roleService.getAllRoles();
    },
  ),

  getForSelection: authorizedProcedure(
    PERMISSION_RESOURCES.USER, // ใช้ Permission ของ USER
    PERMISSION_ACTIONS.READ, //   เพราะ Logic คือ "ถ้าคุณมีสิทธิ์ดูผู้ใช้ คุณก็ควรจะเห็น Role เพื่อใช้กรอง"
  ).query(async () => {
    return roleService.getRolesForSelection();
  }),

  getById: authorizedProcedure(PERMISSION_RESOURCES.ROLE, PERMISSION_ACTIONS.READ)
    .input(idParamSchema)
    .query(async ({ input }) => {
      return roleService.getRoleById(input.id);
    }),

  create: authorizedProcedure(PERMISSION_RESOURCES.ROLE, PERMISSION_ACTIONS.CREATE)
    .input(
      roleSchema.extend({
        permissionIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const actorId = ctx.session.user.id;
      return roleService.createRole(input, actorId);
    }),

  update: authorizedProcedure(PERMISSION_RESOURCES.ROLE, PERMISSION_ACTIONS.UPDATE)
    .input(
      idParamSchema.extend({
        data: roleSchema.extend({
          permissionIds: z.array(z.string()),
        }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const actorId = ctx.session.user.id;
      return roleService.updateRole(input.id, input.data, actorId);
    }),

  delete: authorizedProcedure(PERMISSION_RESOURCES.ROLE, PERMISSION_ACTIONS.DELETE)
    .input(idParamSchema)
    .mutation(async ({ input, ctx }) => {
      const actorId = ctx.session.user.id;
      return roleService.deleteRole(input.id, actorId);
    }),
});
