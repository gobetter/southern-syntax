import prisma from "@southern-syntax/db";

import type { Prisma } from "@prisma/client";

/**
 * กำหนด Type สำหรับ `details` ใน AuditLog เพื่อให้มีโครงสร้างที่แน่นอน
 * สามารถขยายได้ในอนาคต เช่น เพิ่ม ipAddress
 */
interface AuditLogDetails {
  input?: unknown; // ข้อมูลที่ใช้ในการกระทำนั้นๆ
  oldData?: unknown; // ข้อมูลเก่า (สำหรับ action: UPDATE, DELETE)
  newData?: unknown; // ข้อมูลใหม่ (สำหรับ action: CREATE, UPDATE)
  [key: string]: unknown; // ✅ This allows any other properties like 'deletedCount'
}

/**
 * พารามิเตอร์สำหรับฟังก์ชัน createLog
 */
interface CreateLogParams {
  actorId: string; // ID ของผู้ที่กระทำการ (จาก session)
  action: string; // การกระทำ เช่น 'USER_CREATED', 'ROLE_UPDATED'
  entityType: string; // ประเภทของสิ่งที่ถูกกระทำ เช่น 'USER', 'ROLE'
  entityId: string; // ID ของสิ่งที่ถูกกระทำ
  details?: AuditLogDetails;
}

/**
 * ดึงข้อมูล Audit Log ทั้งหมดพร้อมการแบ่งหน้า
 */
async function getAllLogs(params: { page?: number; pageSize?: number }) {
  const { page = 1, pageSize = 25 } = params; // แสดงผล 25 รายการต่อหน้า
  const skip = (page - 1) * pageSize;

  const where: Prisma.AuditLogWhereInput = {};

  const [logs, totalCount] = await prisma.$transaction([
    prisma.auditLog.findMany({
      where,
      take: pageSize,
      skip,
      orderBy: { createdAt: "desc" }, // เรียงจากใหม่ไปเก่าเสมอ
      include: {
        user: {
          // ดึงข้อมูลผู้ที่กระทำมาด้วย
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { data: logs, totalCount };
}

/**
 * ฟังก์ชันกลางสำหรับสร้าง Audit Log
 * @param params - ข้อมูลสำหรับสร้าง Log
 */
async function createLog(params: CreateLogParams) {
  const { actorId, action, entityType, entityId, details } = params;

  try {
    await prisma.auditLog.create({
      data: {
        userId: actorId, // userId ใน schema คือ actorId
        action,
        entityType,
        entityId,
        details: (details || {}) as Prisma.JsonObject,
      },
    });
  } catch (error) {
    // ใน Production จริง อาจจะต้องการระบบ Logging ที่ดีกว่านี้
    // แต่ตอนนี้การ console.error ก็เพียงพอ
    console.error("Failed to create audit log:", error);
  }
}

export const auditLogService = {
  createLog,
  getAllLogs,
};

export type { CreateLogParams };
