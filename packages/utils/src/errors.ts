// packages/utils/src/errors.ts

// types ที่ใช้ร่วม
export type ErrorContext = Record<string, string | number>;
export type MessageKey = `error.${string}`; // ✅ ไม่รวม string ตรง ๆ แล้ว

type ErrorWithCause = Error & { cause?: unknown };

/** ข้อผิดพลาดที่มี messageKey สำหรับ i18n และ (อาจมี) context */
export class TranslatedUploadError extends Error {
  public readonly messageKey: MessageKey;
  public readonly context?: ErrorContext;

  constructor(
    messageKey: MessageKey,
    context?: ErrorContext,
    options?: { cause?: unknown }
  ) {
    super(messageKey);
    this.name = "TranslatedUploadError";
    this.messageKey = messageKey;
    if (context) this.context = context;

    // แนบ cause แบบไม่พึ่ง ErrorOptions (ปลอดภัยกับ target/lib ทุกแบบ)
    if (options?.cause !== undefined) {
      Object.defineProperty(this, "cause", {
        value: options.cause,
        enumerable: false,
        configurable: true,
        writable: true,
      });
    }

    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON() {
    const { cause } = this as ErrorWithCause;
    return {
      name: this.name,
      messageKey: this.messageKey,
      ...(this.context ? { context: this.context } : {}),
      ...(cause !== undefined ? { cause } : {}),
    };
  }
}

/** ข้อผิดพลาดกรณีไฟล์ซ้ำ */
export class DuplicateFileError extends TranslatedUploadError {
  constructor(context?: ErrorContext, options?: { cause?: unknown }) {
    super("error.duplicate_file", context, options);
    this.name = "DuplicateFileError";
  }
}

/** type guard ใช้แยก error ภายหลัง (เช่นใน error handler) */
export const isTranslatedUploadError = (
  e: unknown
): e is TranslatedUploadError => e instanceof TranslatedUploadError;
