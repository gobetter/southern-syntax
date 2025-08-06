// src/server/routers/content/media-tag.ts
import { router, authorizedProcedure } from "@/server/trpc";
import { idParamSchema } from "@southern-syntax/schemas/common";
import {
  PERMISSION_RESOURCES,
  PERMISSION_ACTIONS,
} from "@southern-syntax/auth";
import { mediaTagService } from "@/services/media-tag";
import { mediaTagInputSchema } from "@southern-syntax/schemas/media-taxonomy";

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
