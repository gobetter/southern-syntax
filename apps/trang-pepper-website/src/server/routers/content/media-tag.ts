import { idParamSchema } from "@southern-syntax/schemas/common";
import { mediaTagInputSchema } from "@southern-syntax/schemas/media-taxonomy";

import { router, authorizedProcedure, PERMISSION_ACTIONS, PERMISSION_RESOURCES } from "@southern-syntax/trpc";
import { mediaTagService } from "@southern-syntax/domain-admin/media-tag";

export const mediaTagRouter = router({
  getAll: authorizedProcedure(
    PERMISSION_RESOURCES.MEDIA_TAXONOMY,
    PERMISSION_ACTIONS.READ
  ).query(async () => {
    return mediaTagService.getAll();
  }),
  create: authorizedProcedure(
    PERMISSION_RESOURCES.MEDIA_TAXONOMY,
    PERMISSION_ACTIONS.CREATE
  )
    .input(mediaTagInputSchema)
    .mutation(({ input, ctx }) => {
      const actorId = ctx.session.user.id;
      return mediaTagService.create(input, actorId);
    }),

  update: authorizedProcedure(
    PERMISSION_RESOURCES.MEDIA_TAXONOMY,
    PERMISSION_ACTIONS.UPDATE
  )
    .input(idParamSchema.extend({ data: mediaTagInputSchema }))
    .mutation(({ input, ctx }) => {
      const actorId = ctx.session.user.id;
      return mediaTagService.update(input.id, input.data, actorId);
    }),

  delete: authorizedProcedure(
    PERMISSION_RESOURCES.MEDIA_TAXONOMY,
    PERMISSION_ACTIONS.DELETE
  )
    .input(idParamSchema)
    .mutation(({ input, ctx }) => {
      const actorId = ctx.session.user.id;
      return mediaTagService.delete(input.id, actorId);
    }),
});
