// src/lib/api-error-handler.ts
// import { NextResponse } from 'next/server';
import { ZodError } from "zod";
// Import Error ตัวแม่เข้ามา
import { TranslatedUploadError } from "./errors";

// Helper function to create JSON responses without relying on Next.js
function jsonResponse(body: unknown, init: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
  });
}

export function handleApiError(error: unknown) {
  console.error("[API Error]", error);

  if (error instanceof ZodError) {
    // return NextResponse.json(
    return jsonResponse(
      {
        message: "Validation failed",
        errors: error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  // ทำให้ Handler รู้จัก Error ตัวแม่
  // ตอนนี้ไม่ว่าจะเป็น DuplicateFileError หรือ Error ลูกตัวอื่นๆ ก็จะเข้าเงื่อนไขนี้
  if (error instanceof TranslatedUploadError) {
    // return NextResponse.json(
    return jsonResponse(
      {
        // ส่ง messageKey และ context กลับไปให้ครบ
        error: error.messageKey,
        context: error.context,
      },
      { status: 400 } // หรือ 409 Conflict สำหรับ duplicate ก็เป็นทางเลือกที่ดี
    );
  }

  // return NextResponse.json(
  return jsonResponse(
    { error: "unexpected_error", context: {} }, // ส่งโครงสร้างเดียวกัน
    { status: 500 }
  );
}
