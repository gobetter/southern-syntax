import { NextResponse } from "next/server";

import { prisma } from "@southern-syntax/db";

export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      // อาจจะกรองเอาเฉพาะ Role ที่ต้องการให้ผู้ใช้ใหม่เลือกได้
      where: {
        isSelectableOnRegistration: true,
        // key: {
        //   not: 'SUPERADMIN', // ตัวอย่าง: ไม่ให้ผู้ใช้ทั่วไปสมัครเป็น Superadmin
        // },
      },
      select: { id: true, name: true, key: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(roles);
  } catch (error) {
    console.error("Error fetching selectable roles:", error);
    // ส่งกลับไปเป็น 500 Internal Server Error พร้อมข้อความที่ชัดเจน
    return NextResponse.json(
      { message: "Could not fetch roles from the database." },
      { status: 500 }
    );
  }
}
