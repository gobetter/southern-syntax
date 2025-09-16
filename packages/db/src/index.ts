import "server-only";
import { PrismaClient, Prisma } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  process.env.NODE_ENV === "production"
    ? new PrismaClient()
    : (globalThis.prisma ??= new PrismaClient());

export { Prisma };
export type { Prisma as PrismaTypes };

export const isUniqueViolation = (
  e: unknown
): e is InstanceType<typeof Prisma.PrismaClientKnownRequestError> & {
  code: "P2002";
} => e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
