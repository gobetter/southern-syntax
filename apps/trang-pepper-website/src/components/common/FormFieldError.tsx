"use client";

import type { FieldError } from "react-hook-form";
import { useTranslations } from "next-intl";

import type { FormErrorKey } from "@southern-syntax/utils";
import { isValidErrorKey } from "@southern-syntax/utils";

interface FormFieldErrorProps {
  error?: FieldError;
}

export default function FormFieldError({ error }: FormFieldErrorProps) {
  const t_form_errors = useTranslations("common.form_errors");

  // ถ้าไม่มี error หรือไม่มี message ก็ไม่ต้องแสดงผลอะไรเลย
  if (!error?.message) {
    return null;
  }

  // ตรวจสอบว่า key ถูกต้องหรือไม่ก่อนที่จะแปล
  if (isValidErrorKey(error.message)) {
    return (
      <p className="mt-1 text-sm text-red-500">
        {t_form_errors(error.message as FormErrorKey)}
      </p>
    );
  }

  // Fallback กรณีที่ message ไม่ใช่ key (อาจจะเป็น error จากที่อื่น)
  return <p className="mt-1 text-sm text-red-500">{error.message}</p>;
}
