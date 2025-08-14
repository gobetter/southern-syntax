import { getServerSession } from "next-auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { authOptions } from "@southern-syntax/auth/server";
import {
  can,
  PERMISSION_ACTIONS,
  PERMISSION_RESOURCES,
} from "@southern-syntax/auth";
import { handleApiError, parseMultipartFormData } from "@southern-syntax/utils";

import { mediaService } from "@/services/media";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session?.user?.id ||
      !can(session, PERMISSION_RESOURCES.MEDIA, PERMISSION_ACTIONS.CREATE)
    ) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const actorId = session.user.id;

    const { files, fields } = await parseMultipartFormData(req);
    const file = files.file?.[0]; // เอาไฟล์แรกที่เจอใน field 'file'

    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded." },
        { status: 400 }
      );
    }

    // แปลง JSON string กลับเป็น object (ถ้ามี)
    const title = fields.title ? JSON.parse(fields.title) : undefined;
    const altText = fields.altText ? JSON.parse(fields.altText) : undefined;
    const caption = fields.caption ? JSON.parse(fields.caption) : undefined;

    // 👇 อ่านค่า categoryId และ tagIds จาก fields
    const categoryId = fields.categoryId?.[0] || undefined;
    // tagIds จะถูกส่งมาเป็น string ที่คั่นด้วย comma, เราต้อง split มัน
    const tagIds = fields.tagIds?.[0]?.split(",") || [];

    const newMedia = await mediaService.uploadMedia(
      {
        filename: file.filename,
        mimeType: file.mimeType,
        fileSize: file.content.length,
        buffer: file.content,
        userId: session.user.id,
        title,
        altText,
        caption,
        categoryId,
        tagIds,
      },
      actorId
    );

    return NextResponse.json(newMedia, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
