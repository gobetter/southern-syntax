// สร้างค่าคงที่เป็น readonly tuple โดยใช้ `as const`
export const VALID_USER_STATUSES = ["active", "inactive"] as const;
export const USER_SORTABLE_FIELDS = [
  "name",
  "email",
  "createdAt",
  "role",
  "isActive",
] as const;
export const USER_STATUS_VIEWS = ["all", "active", "inactive"] as const;

// สร้าง Type โดยการอนุมานจากค่าคงที่ที่เราสร้างขึ้น (Inferred Types)
export type UserStatusFilter = (typeof VALID_USER_STATUSES)[number]; // จะได้เป็น 'active' | 'inactive'
export type UserStatusView = (typeof USER_STATUS_VIEWS)[number]; // จะได้เป็น 'all' | 'active' | 'inactive'
export type UserSortableField = (typeof USER_SORTABLE_FIELDS)[number];
