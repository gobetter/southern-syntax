// Constants สำหรับ Role Names ที่ระบบรู้จัก
export const ROLE_NAMES = {
  SUPERADMIN: "SUPERADMIN", // ผู้ดูแลระบบสูงสุด (ควรมีเพียง 1 คน หรือจำกัดมาก)
  // ADMIN: 'ADMIN', // ผู้ดูแลระบบทั่วไป
  // EDITOR: 'EDITOR', // ผู้แก้ไขเนื้อหา
  // VIEWER: 'VIEWER', // ผู้อ่านเท่านั้น
} as const; // <-- ทำให้เป็น readonly object
export type RoleNameType = (typeof ROLE_NAMES)[keyof typeof ROLE_NAMES]; // "SUPERADMIN" | "ADMIN" | ...

// Constants สำหรับ Actions ที่เป็นไปได้สำหรับ Permissions
export const PERMISSION_ACTIONS = {
  CREATE: "CREATE", // สร้าง
  READ: "READ", // อ่าน
  UPDATE: "UPDATE", // แก้ไข
  DELETE: "DELETE", // ลบ
  ASSIGN: "ASSIGN",
  // เพิ่ม Actions อื่นๆ ที่เป็นไปได้ในอนาคต เช่น 'PUBLISH', 'APPROVE', 'MANAGE'
} as const; // <-- ทำให้เป็น readonly object
export type PermissionActionType =
  (typeof PERMISSION_ACTIONS)[keyof typeof PERMISSION_ACTIONS];

export const PERMISSION_RESOURCES = {
  // --- การจัดการระบบ (System Management) ---
  ADMIN_DASHBOARD: "ADMIN_DASHBOARD", // สำหรับเข้าถึงหน้า Dashboard หลัก (Read-only)
  SETTINGS: "SETTINGS", // สำหรับการตั้งค่าระบบในอนาคต (เช่น ตั้งค่าเว็บ, ภาษา)
  AUDIT_LOG: "AUDIT_LOG", // สำหรับการเข้าดู Audit Log (Read-only สำหรับ Super Admin)
  LANGUAGE: "LANGUAGE", // สำหรับจัดการภาษา (CRU - ไม่มี Delete)

  // --- การจัดการผู้ใช้และสิทธิ์ (RBAC) ---
  USER: "USER", // จัดการผู้ใช้ (CRUD)
  ROLE: "ROLE", // จัดการบทบาทและสิทธิ์ (CRUD)
  // ใช้ควบคุมสิทธิ์ระดับสูง
  ADMIN_ACCESS: "ADMIN_ACCESS",

  // --- การจัดการเนื้อหา (Content Management) ---
  POST: "POST", // จัดการบทความ (Posts)
  POST_CATEGORY: "POST_CATEGORY", // จัดการหมวดหมู่บทความ
  POST_TAG: "POST_TAG", // จัดการแท็กบทความ

  // --- การจัดการร้านค้า (E-commerce Management) ---
  PRODUCT: "PRODUCT", // จัดการสินค้า
  PRODUCT_CATEGORY: "PRODUCT_CATEGORY", // จัดการหมวดหมู่สินค้า
  PRODUCT_TAG: "PRODUCT_TAG", // จัดการแท็กสินค้า

  // --- การจัดการสื่อ (Media Management) ---
  MEDIA: "MEDIA", // จัดการไฟล์ใน Media Library
  MEDIA_TAXONOMY: "MEDIA_TAXONOMY", // จัดการหมวดหมู่และแท็กของ Media ทั้งหมด
} as const;
export type PermissionResourceType =
  (typeof PERMISSION_RESOURCES)[keyof typeof PERMISSION_RESOURCES];
