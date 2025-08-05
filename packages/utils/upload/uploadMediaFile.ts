// src/lib/upload/uploadMediaFile.ts
import { DuplicateFileError, TranslatedUploadError } from '@/lib/errors';

export async function uploadMediaFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/media/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    // 1. อ่าน JSON response จาก server
    const errorData = await response.json().catch(() => ({
      error: 'unexpected_api_error', // Key สำรองกรณี parse JSON ไม่ได้
      context: { filename: file.name },
    }));

    const messageKey = errorData.error;
    const context = errorData.context || { filename: file.name };

    // 2. ตรวจสอบ messageKey เพื่อสร้าง Error Class ที่ถูกต้อง
    if (messageKey === 'error.duplicate_file') {
      throw new DuplicateFileError(context);
    }

    // 3. สำหรับ Error อื่นๆ ให้โยน TranslatedUploadError ทั่วไป
    throw new TranslatedUploadError(messageKey, context);
  }

  return file.name;
}
