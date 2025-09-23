import { initTRPC, TRPCError } from "@trpc/server";

import { can, type PermissionActionType, type PermissionResourceType } from "@southern-syntax/auth";
import { getServerAuthSession } from "@southern-syntax/auth/server";
import { prisma } from "@southern-syntax/db";

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

export async function createTRPCContext() {
  const session = await getServerAuthSession();

  return {
    session,
    prisma,
  };
}

const t = initTRPC.context<TRPCContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(
  t.middleware(({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next({ ctx: { session: ctx.session } });
  })
);

export function authorizedProcedure(
  resource: PermissionResourceType,
  action: PermissionActionType
) {
  return protectedProcedure.use(
    t.middleware(async ({ ctx, next }) => {
      const hasPermission = await can(ctx.session, resource, action);

      if (!hasPermission) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return next();
    })
  );
}
