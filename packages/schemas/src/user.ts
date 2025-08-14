import { z } from "zod";

import { LocalizedStringSchema } from "./i18n";
import { passwordPolicySchema } from "./password";

const requiredInDefaultLang = "error_field_is_required_in_default_lang";

export const userCreateSchema = z
  .object({
    name: LocalizedStringSchema, // ใช้ Schema พื้นฐานที่ทุกภาษาเป็น optional
    email: z.string().email({ message: "error_invalid_email" }),
    password: passwordPolicySchema,
    confirmPassword: z.string().min(1, "error_field_is_required"),
    roleId: z.string().uuid({ message: "error_role_required" }),
    isActive: z.boolean(),
  })
  // ใช้ .refine() เพื่อตรวจสอบชื่อภาษาอังกฤษ
  .refine(
    (data) => {
      // ตรวจสอบว่า name ของภาษาหลัก (en) ต้องไม่เป็นค่าว่าง
      // return data.name?.[defaultLocale] && data.name[defaultLocale]!.trim().length > 0;

      // ตรวจสอบว่า name ของภาษาอังกฤษต้องไม่เป็นค่าว่าง
      return data.name?.en && data.name.en.trim().length > 0;
    },
    {
      // ถ้าเงื่อนไขข้างบนเป็น false ให้สร้าง error นี้
      message: requiredInDefaultLang,
      // ระบุ path เป็น Array ชี้ไปที่ฟิลด์ที่ต้องการโดยตรง
      // path: ['name', defaultLocale], // ผลลัพธ์คือ ['name', 'en']
      path: ["name", "en"],
    }
  )
  // ใช้ .refine() อีกอันเพื่อตรวจสอบการยืนยันรหัสผ่าน
  .refine((data) => data.password === data.confirmPassword, {
    message: "error_passwords_do_not_match",
    path: ["confirmPassword"],
  });

// This is the OUTPUT type after Zod has parsed the data.
// Note: `isActive` is a definite boolean here.
export type UserCreateOutput = z.infer<typeof userCreateSchema>;

// This is the INPUT type for the form. It correctly types `isActive` as optional.
export type UserCreateInput = z.input<typeof userCreateSchema>;

// Schema สำหรับการอัปเดตข้อมูลผู้ใช้จากหน้า Admin
// ทุก field เป็น optional เพราะ Admin อาจจะต้องการแก้แค่บางอย่าง
export const userUpdateSchema = z
  .object({
    name: LocalizedStringSchema.optional(),
    email: z.string().email("error_invalid_email").optional(),
    password: z
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
      })
      .optional() // ทำให้เป็น optional (ถ้าไม่กรอก = ไม่เปลี่ยน)
      .or(z.literal("")), // อนุญาตให้เป็น string ว่างได้

    confirmPassword: z.string().optional(),
    roleId: z.string().uuid("error_role_required").optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // ตรวจสอบ name.en ก็ต่อเมื่อมีการส่ง 'name' object เข้ามาเท่านั้น
      if (data.name !== undefined) {
        return data.name.en && data.name.en.trim().length > 0;
      }
      // ถ้าไม่มีการส่ง 'name' object มา (เช่น กรณีปิดการใช้งาน) ให้ผ่าน validation ไปเลย
      return true;
    },
    {
      message: requiredInDefaultLang,
      path: ["name", "en"],
    }
  )
  // .refine() สำหรับ password
  .refine(
    (data) => {
      // ถ้าช่อง password มีค่า (ผู้ใช้ต้องการเปลี่ยนรหัสผ่าน)
      if (data.password) {
        // ให้ตรวจสอบว่า confirmPassword ต้องตรงกับ password
        return data.password === data.confirmPassword;
      }
      // ถ้าช่อง password ว่าง (ผู้ใช้ไม่ต้องการเปลี่ยน) ให้ผ่าน validation ไปเลย
      return true;
    },
    {
      message: "error_passwords_do_not_match",
      path: ["confirmPassword"], // ให้ error แสดงที่ช่อง confirmPassword
    }
  );

// Input type สำหรับฟอร์ม (z.input<> จะจัดการ optional fields ได้ถูกต้อง)
export type UserUpdateInput = z.input<typeof userUpdateSchema>;
// Output type ที่ Service จะได้รับหลังจากการ validation (z.infer<>)
export type UserUpdateOutput = z.infer<typeof userUpdateSchema>;
