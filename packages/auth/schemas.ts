import { z } from "zod";

import { PERMISSION_ACTIONS, PERMISSION_RESOURCES } from "./constants";
import {
  passwordPolicySchema,
  LocalizedStringSchema,
} from "@southern-syntax/schemas";
import { defaultLocale } from "@southern-syntax/config";

const requiredInDefaultLang = "error_field_is_required_in_default_lang";

export type CredentialsInput = z.infer<typeof credentialsSchema>;

// สำหรับใช้ในหน้า "ล็อกอิน" เท่านั้น
export const credentialsSchema = z.object({
  email: z
    .string()
    .email("error_invalid_email")
    .min(1, "error_field_is_required"),
  // ใช้แค่ .string() ไม่ต้องมีเงื่อนไขซับซ้อน
  password: z.string().min(1, "error_field_is_required"),
});

// Schema สำหรับการลงทะเบียนผู้ใช้ใหม่
export const registerSchema = z
  .object({
    email: z
      .string()
      .email("error_invalid_email")
      .min(1, "error_field_is_required"),
    password: passwordPolicySchema,
    name: z.string().min(1, "error_field_is_required"),
    roleId: z.string().uuid({ message: "error_role_required" }),
    confirmPassword: z.string().min(1, "error_field_is_required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "error_passwords_do_not_match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

// --- Schemas สำหรับ Role และ Permission (สำหรับ Validation API/UI) ---
// Note: name, action, resource เป็น String ใน DB แต่ใช้ Zod enum เพื่อ Validation
// และ Type Safety ที่ Compile-time

/*
export const roleSchema = z.object({
  id: z.string().optional(), // ID จะถูกสร้างโดย DB/Prisma
  key: z.string().min(1, 'Role key ต้องไม่ว่างเปล่า'),
  name: z.string().min(1, 'Role name ต้องไม่ว่างเปล่า'),
  description: z.string().optional(),
  isSystem: z.boolean().default(false),
  // ตัวอย่าง: name: z.enum(ROLE_NAMES), // ถ้าต้องการบังคับค่าตาม enum ที่เข้มงวด
});
export type RoleInput = z.infer<typeof roleSchema>;
*/

export const roleSchema = z.object({
  id: z.string().optional(),
  key: z.string().min(1, "error_field_is_required"), // ใช้คีย์สำหรับแปลภาษา

  // เปลี่ยน name ให้ใช้ LocalizedStringSchema และบังคับภาษาหลัก
  name: LocalizedStringSchema.refine(
    (data) => data?.[defaultLocale] && data[defaultLocale]!.trim().length > 0,
    {
      message: requiredInDefaultLang,
      path: [defaultLocale],
    }
  ),
  description: z.string().optional(),
  // isSystem: z.boolean().default(false),
  isSystem: z
    .boolean()
    .optional()
    .transform((val) => val ?? false),
});
export type RoleInput = z.infer<typeof roleSchema>;

export const permissionSchema = z.object({
  id: z.string().optional(), // ID จะถูกสร้างโดย DB/Prisma
  key: z.string().min(1, "Permission key ต้องไม่ว่างเปล่า"),
  action: z.enum([
    PERMISSION_ACTIONS.CREATE,
    PERMISSION_ACTIONS.READ,
    PERMISSION_ACTIONS.UPDATE,
    PERMISSION_ACTIONS.DELETE,
    // สามารถใส่ค่าอื่น ๆ จาก PERMISSION_ACTIONS ถ้ามี
  ]),
  // resource: z.enum([
  //   PERMISSION_RESOURCES.USER,
  //   PERMISSION_RESOURCES.ROLE,
  //   PERMISSION_RESOURCES.PERMISSION,
  //   PERMISSION_RESOURCES.PRODUCT,
  //   PERMISSION_RESOURCES.PRODUCT_CATEGORY,
  //   PERMISSION_RESOURCES.POST,
  //   PERMISSION_RESOURCES.POST_CATEGORY,
  //   PERMISSION_RESOURCES.POST_TAG,
  //   PERMISSION_RESOURCES.MEDIA,
  //   PERMISSION_RESOURCES.MEDIA_TAXONOMY,
  //   PERMISSION_RESOURCES.LANGUAGE,
  //   PERMISSION_RESOURCES.SETTINGS,
  //   PERMISSION_RESOURCES.ADMIN_DASHBOARD,
  //   // สามารถใส่ค่าอื่น ๆ จาก PERMISSION_RESOURCES ถ้ามี
  // ]),
  resource: z.enum(
    Object.values(PERMISSION_RESOURCES) as [string, ...string[]]
  ),
  description: z.string().optional(),
  isSystem: z.boolean().default(false),
});
export type PermissionInput = z.infer<typeof permissionSchema>;

// Schema สำหรับ RolePermission (ตารางเชื่อมโยง)
export const rolePermissionSchema = z.object({
  id: z.string().optional(),
  roleId: z.string(),
  permissionId: z.string(),
});
export type RolePermissionInput = z.infer<typeof rolePermissionSchema>;
