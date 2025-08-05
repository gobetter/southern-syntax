import "server-only";

import { PrismaClient } from "@prisma/client";

// ตรวจสอบว่า `globalThis` มี `prisma` property หรือไม่
// เพื่อหลีกเลี่ยงการสร้าง PrismaClient instance ใหม่ทุกครั้งที่ HMR ทำงาน
declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  // สำหรับ development, ใช้ globalThis เพื่อรักษา instance เดียว
  if (!globalThis.prisma) {
    globalThis.prisma = new PrismaClient();
  }
  prisma = globalThis.prisma;
}

export default prisma;
