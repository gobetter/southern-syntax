// src/lib/errors.ts
// Error Class สำหรับข้อผิดพลาดจากการอัปโหลดที่แปลภาษาได้
export class TranslatedUploadError extends Error {
  public readonly messageKey: string;
  public readonly context?: Record<string, string | number>;

  constructor(messageKey: string, context?: Record<string, string | number>) {
    super(messageKey);
    this.name = 'TranslatedUploadError';
    this.messageKey = messageKey;
    this.context = context;
  }
}

// ทำให้ DuplicateFileError สืบทอดจาก TranslatedUploadError
export class DuplicateFileError extends TranslatedUploadError {
  // รับ context เข้ามาได้ (เช่น filename)
  constructor(context?: Record<string, string | number>) {
    // เรียก constructor ของแม่ (TranslatedUploadError)
    // โดยส่ง messageKey ที่ตายตัวคือ 'error.duplicate_file' กลับขึ้นไป
    super('error.duplicate_file', context);
    this.name = 'DuplicateFileError';
  }
}
