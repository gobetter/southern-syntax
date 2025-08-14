import { z } from "zod";

// สร้าง Schema สำหรับนโยบายรหัสผ่านโดยเฉพาะ เพื่อนำไปใช้ซ้ำ
export const passwordPolicySchema = z
  .string()
  .min(8, "error_password_min_length")
  .refine((password) => /[a-z]/.test(password), {
    message: "error_password_require_lowercase",
  })
  .refine((password) => /[A-Z]/.test(password), {
    message: "error_password_require_uppercase",
  })
  .refine((password) => /\d/.test(password), {
    message: "error_password_require_number",
  });
