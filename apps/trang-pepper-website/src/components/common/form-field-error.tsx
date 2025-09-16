import { useTranslations } from "next-intl";
import type { FieldError } from "react-hook-form";
import enMessages from "@southern-syntax/i18n/messages/en";

type FormErrorKey = keyof typeof enMessages.common.form_errors;

type WithMessage = { message?: unknown };

type Props = {
  // error?: { message?: unknown } | null;
  // รองรับทั้ง FieldError ของ RHF และรูปแบบเดิมของคุณ
  // error?: FieldError | { message?: unknown } | null;
  error: FieldError | WithMessage | null | undefined;
};

// type guard: มี key 'message' จริง ๆ
function hasMessage(x: unknown): x is WithMessage {
  return typeof x === "object" && x !== null && "message" in x;
}

// type guard: ตรวจ key ที่รู้จักใน resource EN
function isKnownFormErrorKey(k: string): k is FormErrorKey {
  return Object.prototype.hasOwnProperty.call(enMessages.common.form_errors, k);
}

export default function FormFieldError({ error }: Props) {
  const tCommon = useTranslations("common");
  const tFormErrors = useTranslations("common.form_errors");

  // if (!error?.message || typeof error.message !== "string") return null;

  // ดึง message ออกมาแบบปลอดภัย
  const rawMessage: unknown =
    (error as FieldError | undefined)?.message ??
    (hasMessage(error) ? error.message : undefined);

  if (typeof rawMessage !== "string" || rawMessage.length === 0) {
    return null;
  }

  const rawKey = rawMessage;

  if (isKnownFormErrorKey(rawKey)) {
    try {
      // แปลด้วย locale ปัจจุบัน
      return <p className="mt-1 text-sm text-red-500">{tFormErrors(rawKey)}</p>;
    } catch {
      // ถ้า locale ปัจจุบันไม่มีคีย์ ให้ fallback เป็น EN
      return (
        <p className="mt-1 text-sm text-red-500">
          {enMessages.common.form_errors[rawKey]}
        </p>
      );
    }
  }

  // คีย์ไม่รู้จัก -> fallback ข้อความทั่วไป
  return (
    <p className="mt-1 text-sm text-red-500">
      {tCommon("errors.something_went_wrong")}
    </p>
  );
}
