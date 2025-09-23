// import { getServerSession } from "next-auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// import { authOptions } from "@southern-syntax/auth/server";
import { getServerAuthSession } from "@southern-syntax/auth/server";
import {
  can,
  PERMISSION_ACTIONS,
  PERMISSION_RESOURCES,
} from "@southern-syntax/auth";
import { handleApiError, parseMultipartFormData } from "@southern-syntax/utils-server";
import type { Buffer } from "node:buffer";

import { mediaService } from "@southern-syntax/domain-admin/media";

type LocalizedTitle = { en?: string; th?: string };

function toLocalizedTitle(obj?: Record<string, string>): LocalizedTitle {
  const out: LocalizedTitle = {};
  if (obj?.en) out.en = String(obj.en);
  if (obj?.th) out.th = String(obj.th);
  return out;
}

// util เล็ก ๆ
function first(v?: string[] | string): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v ?? undefined;
}
function safeJson<T = unknown>(s?: string): T | undefined {
  if (!s) return undefined;
  try {
    return JSON.parse(s) as T;
  } catch {
    return undefined;
  }
}
function splitCsv(s?: string): string[] | undefined {
  if (!s) return undefined;
  const arr = s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  return arr.length ? arr : undefined;
}
const isRecordOfString = (v: unknown): v is Record<string, string> =>
  typeof v === "object" &&
  v !== null &&
  !Array.isArray(v) &&
  Object.values(v as Record<string, unknown>).every(
    (x) => typeof x === "string"
  );

export async function POST(req: NextRequest) {
  try {
    // const session = await getServerSession(authOptions);
    const session = await getServerAuthSession();
    if (
      !session?.user?.id ||
      !can(session, PERMISSION_RESOURCES.MEDIA, PERMISSION_ACTIONS.CREATE)
    ) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const actorId = session.user.id;

    const { files, fields } = await parseMultipartFormData(req);
    const file = files.file?.[0];
    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded." },
        { status: 400 }
      );
    }

    // ดึงค่าจาก fields (รองรับทั้ง string และ string[])
    const titleRaw = first(fields.title);
    const altTextRaw = first(fields.altText);
    const captionRaw = first(fields.caption);
    const categoryId = first(fields.categoryId);
    const tagIds = splitCsv(first(fields.tagIds));

    // แปลง JSON เป็น object เฉพาะกรณีที่เป็น record<string,string> เท่านั้น
    const title = safeJson<Record<string, string>>(titleRaw);
    const altText = safeJson<Record<string, string>>(altTextRaw);
    const caption = safeJson<Record<string, string>>(captionRaw);
    const titleObj = toLocalizedTitle(title);

    const payload = {
      filename: file.filename,
      mimeType: file.mimeType,
      fileSize: file.content.length,
      buffer: file.content as Buffer,
      userId: actorId,
      title: titleObj,

      // ใส่เฉพาะคีย์ที่มีค่าจริง เพื่อตรงกับ exactOptionalPropertyTypes
      // ...(title && isRecordOfString(title) ? { title } : {}),
      ...(altText && isRecordOfString(altText) ? { altText } : {}),
      ...(caption && isRecordOfString(caption) ? { caption } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(tagIds && tagIds.length ? { tagIds } : {}),
    } satisfies {
      filename: string;
      mimeType: string;
      fileSize: number;
      buffer: Buffer;
      userId: string;
      title: { en?: string; th?: string };
      altText?: Record<string, string>;
      caption?: Record<string, string>;
      categoryId?: string;
      tagIds?: string[];
    };

    const newMedia = await mediaService.uploadMedia(payload, actorId);
    return NextResponse.json(newMedia, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
