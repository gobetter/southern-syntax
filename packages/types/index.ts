export * from "./audit-log";
export * from "./common";
export * from "./forms";
export * from "./media-taxonomy";
export * from "./media";
export * from "./user";
export * from "./auth";
export * from "./role";
export type { LocalizedString } from "./i18n";

export interface FormErrors {
  error_field_is_required: string;
  error_invalid_email: string;
  error_passwords_do_not_match: string;
  error_role_required: string;
  // เพิ่ม key ของ error อื่นๆ ที่คุณมีใน en.json ที่นี่
}

export interface CommonMessages {
  form_errors: FormErrors;
  actions: Record<string, string>;
}
