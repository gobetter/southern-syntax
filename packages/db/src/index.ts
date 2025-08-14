import "server-only";
import { PrismaClient, Prisma } from "@prisma/client";

// ใช้ singleton กัน HMR ใน dev
declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!globalThis.prisma) globalThis.prisma = new PrismaClient();
  prisma = globalThis.prisma;
}

// ---- exports ----
// default: ตัว client สำหรับ query
export default prisma;

// รี–เอ็กซ์พอร์ต Prisma เพื่อให้ consumers ใช้คลาส/ชนิดได้
// เช่น instanceof Prisma.PrismaClientKnownRequestError, Prisma.JsonValue ฯลฯ
export { Prisma };
export type { Prisma as PrismaTypes };

// (ออปชัน) helper ตรวจ unique constraint (P2002) ใช้สะดวกขึ้น
export const isUniqueViolation = (
  e: unknown
): e is InstanceType<typeof Prisma.PrismaClientKnownRequestError> & {
  code: "P2002";
} => e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
