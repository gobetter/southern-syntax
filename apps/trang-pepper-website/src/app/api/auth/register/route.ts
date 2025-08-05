import { ZodError } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

import { registerUser } from '@/lib/auth/service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newUser = await registerUser(body);

    // ✅ สร้าง Object ใหม่สำหรับส่งกลับไปให้ Client โดยเฉพาะ
    //    เลือกมาเฉพาะฟิลด์ที่ปลอดภัยและไม่รวม passwordHash
    const userToReturn = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      roleId: newUser.roleId,
      isActive: newUser.isActive,
      // เราจะไม่นำ passwordHash, emailVerifiedAt, ฯลฯ กลับไปด้วย
    };

    // ✅ ส่ง object ที่สะอาดและปลอดภัยนี้กลับไป
    return NextResponse.json(userToReturn, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: 'Invalid input', errors: error.flatten() },
        { status: 400 },
      );
    }
    if (error instanceof Error) {
      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        return NextResponse.json({ message: 'EMAIL_ALREADY_EXISTS' }, { status: 409 });
      }
    }
    console.error('[REGISTER_API_ERROR]', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
