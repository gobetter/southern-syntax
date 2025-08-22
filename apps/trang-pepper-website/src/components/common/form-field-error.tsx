import { useTranslations } from "next-intl";
import enMessages from "@southern-syntax/i18n/messages/en";

type FormErrorKey = keyof typeof enMessages.common.form_errors;

type Props = {
  error?: { message?: unknown } | null;
};

// type guard: ตรวจว่าคีย์ที่ส่งมารู้จักจริงใน resources EN
function isKnownFormErrorKey(k: string): k is FormErrorKey {
  return Object.prototype.hasOwnProperty.call(enMessages.common.form_errors, k);
}

export default function FormFieldError({ error }: Props) {
  const tCommon = useTranslations("common");
  const tFormErrors = useTranslations("common.form_errors");

  if (!error?.message || typeof error.message !== "string") return null;

  const rawKey = error.message;

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
