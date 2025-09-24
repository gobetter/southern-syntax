import { idParamSchema } from "@southern-syntax/schemas/common";
import { mediaCategoryInputSchema } from "@southern-syntax/schemas/media-taxonomy";

import { mediaCategoryService } from "@southern-syntax/domain-admin/media-category";
import { router, authorizedProcedure, PERMISSION_ACTIONS, PERMISSION_RESOURCES } from "@southern-syntax/trpc";

export const mediaCategoryRouter = router({
  getAll: authorizedProcedure(
    PERMISSION_RESOURCES.MEDIA_TAXONOMY,
    PERMISSION_ACTIONS.READ
  ).query(async () => {
    return mediaCategoryService.getAll();
  }),
  create: authorizedProcedure(
    PERMISSION_RESOURCES.MEDIA_TAXONOMY,
    PERMISSION_ACTIONS.CREATE
  )
    .input(mediaCategoryInputSchema)
    .mutation(({ input, ctx }) => {
      const actorId = ctx.session.user.id;
      return mediaCategoryService.create(input, actorId);
    }),

  update: authorizedProcedure(
    PERMISSION_RESOURCES.MEDIA_TAXONOMY,
    PERMISSION_ACTIONS.UPDATE
  )
    .input(idParamSchema.extend({ data: mediaCategoryInputSchema }))
    .mutation(({ input, ctx }) => {
      const actorId = ctx.session.user.id;
      return mediaCategoryService.update(input.id, input.data, actorId);
    }),

  delete: authorizedProcedure(
    PERMISSION_RESOURCES.MEDIA_TAXONOMY,
    PERMISSION_ACTIONS.DELETE
  )
    .input(idParamSchema)
    .mutation(({ input, ctx }) => {
      const actorId = ctx.session.user.id;
      return mediaCategoryService.delete(input.id, actorId);
    }),
});
