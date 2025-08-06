// src/server/routers/content/media-category.ts
import { router, authorizedProcedure } from "@/server/trpc";
import { idParamSchema } from "@southern-syntax/schemas/common";
import {
  PERMISSION_RESOURCES,
  PERMISSION_ACTIONS,
} from "@southern-syntax/auth";
import { mediaCategoryService } from "@/services/media-category";
import { mediaCategoryInputSchema } from "@southern-syntax/schemas/media-taxonomy";

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
