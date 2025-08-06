// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import prisma from "@southern-syntax/db";
import { authOptions, can, hashPassword } from "@southern-syntax/auth/server";
import {
  PERMISSION_RESOURCES,
  PERMISSION_ACTIONS,
} from "@southern-syntax/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // ตรวจสอบสิทธิ์: ผู้ใช้ต้องมีสิทธิ์ "CREATE" บนทรัพยากร "USER"
  const hasPermission = can(
    session,
    PERMISSION_RESOURCES.USER,
    PERMISSION_ACTIONS.CREATE
  );
  if (!hasPermission) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { email, name, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: hashedPassword,
        // roleId: ถ้าต้องการกำหนด role ตั้งแต่สร้าง
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { message: "Error creating user" },
      { status: 500 }
    );
  }
}
