// import { enMessages } from "@southern-syntax/i18n";
import enMessages from "@southern-syntax/i18n/messages/en";
import type { CommonMessages } from "@southern-syntax/types";

const formErrors = (enMessages as unknown as { common: CommonMessages }).common
  .form_errors;

// สร้าง Type ของ Error Keys จาก object ที่ import เข้ามาโดยตรง
// export type FormErrorKey = keyof typeof enMessages.common.form_errors;
export type FormErrorKey = keyof typeof formErrors;

// สร้าง Type Guard function ที่สามารถนำไปใช้ซ้ำได้
export function isValidErrorKey(key: string | undefined): key is FormErrorKey {
  // ตรวจสอบว่า key ไม่ใช่ค่าว่าง และมีอยู่จริงใน object form_errors
  // return !!key && key in enMessages.common.form_errors;
  return typeof key === "string" && key in formErrors;
}
