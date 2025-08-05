"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslations, useLocale } from "next-intl";
import { AlertCircle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  registerSchema,
  type RegisterInput,
} from "@southern-syntax/auth/schemas";

import { Button, Input, Alert, AlertDescription } from "@southern-syntax/ui";
import FormFieldError from "@/components/common/FormFieldError";

export default function RegisterForm() {
  const [apiError, setApiError] = useState<string | null>(null);
  const [roles, setRoles] = useState<
    { id: string; name: string; key: string }[]
  >([]);

  const router = useRouter();
  const locale = useLocale();

  const t_auth = useTranslations("auth");
  const t_form_labels = useTranslations("common.form_labels");
  const t_roles = useTranslations("roles");
  const t_loading = useTranslations("common.general");
  const t_error_codes = useTranslations("common.error_codes");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    fetch("/api/roles")
      .then((r) => r.json())
      .then((data) => {
        setRoles(data);
        if (data.length > 0) {
          setValue("roleId", data[0].id);
        }
      })
      .catch(() => {
        setApiError(t_auth("register.failed_to_load_roles"));
      });
  }, [setValue, t_auth]);

  const onSubmit: SubmitHandler<RegisterInput> = async (data) => {
    setApiError(null);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push(`/${locale}/auth/signin`);
    } else {
      const errorData = await res.json().catch(() => ({}));

      // ตรวจสอบ error message ที่ได้จาก API
      if (errorData.message === "EMAIL_ALREADY_EXISTS") {
        // ถ้าเป็น error ที่เรารู้จัก ให้แปลเป็นข้อความที่สวยงาม
        setApiError(t_error_codes("EMAIL_ALREADY_EXISTS"));
      } else {
        // ถ้าเป็น error อื่นๆ ให้แสดงข้อความทั่วไป
        setApiError(t_auth("register.registration_failed"));
      }
    }
  };

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center">
      <div className="bg-card w-full max-w-md rounded-lg border p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">
          {t_auth("register.title")}
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            {/* Name */}
            <label
              htmlFor="name"
              className="text-foreground block text-sm font-medium"
            >
              {t_form_labels("name_en")}
            </label>
            <Input id="name" {...register("name")} />
            <FormFieldError error={errors.name} />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="text-foreground block text-sm font-medium"
            >
              {t_form_labels("email")}
            </label>
            <Input id="email" type="email" {...register("email")} />
            <FormFieldError error={errors.email} />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="text-foreground block text-sm font-medium"
            >
              {t_form_labels("password")}
            </label>
            <Input id="password" type="password" {...register("password")} />
            <FormFieldError error={errors.password} />
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="text-foreground block text-sm font-medium"
            >
              {t_form_labels("confirm_password")}
            </label>
            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
            />
            <FormFieldError error={errors.confirmPassword} />
          </div>

          {/* Role */}
          <div>
            <label
              htmlFor="roleId"
              className="text-foreground block text-sm font-medium"
            >
              {t_form_labels("role")}
            </label>
            <select
              id="roleId"
              {...register("roleId")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {t_roles(r.key, { fallback: r.name })}
                </option>
              ))}
            </select>
            <FormFieldError error={errors.roleId} />
          </div>

          {apiError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? t_loading("loading") : t_auth("register.button")}
          </Button>
        </form>
      </div>
    </div>
  );
}
