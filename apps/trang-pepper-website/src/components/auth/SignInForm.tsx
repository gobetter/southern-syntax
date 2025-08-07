"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { AlertCircle } from "lucide-react";

import {
  ROLE_NAMES,
  credentialsSchema,
  type CredentialsInput,
} from "@southern-syntax/auth";
import { Alert, AlertDescription, Button, Input } from "@southern-syntax/ui";

import FormFieldError from "@/components/common/FormFieldError";

export default function SignInForm() {
  const [serverError, setServerError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t_auth = useTranslations("auth");
  const t_form_labels = useTranslations("common.form_labels");
  const t_common = useTranslations("common");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CredentialsInput>({
    resolver: zodResolver(credentialsSchema),
  });

  const onSubmit: SubmitHandler<CredentialsInput> = async (data) => {
    setServerError(null);

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      // ตรวจสอบ "คีย์" ที่ได้จาก result.error
      // next-auth จะส่ง message ที่เรา throw ไว้กลับมาใน property `error`
      if (result.error === "invalid_credentials") {
        // ใช้ t() เพื่อแปล "คีย์" เป็นข้อความที่ถูกต้อง
        setServerError(t_auth("login.invalid_credentials"));
      } else {
        // Fallback สำหรับ error อื่นๆ ที่ไม่คาดคิด
        setServerError("An unexpected error occurred.");
      }
    } else if (result?.ok) {
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();

      const userRole = session?.user?.role;

      if (userRole === "ADMIN" || userRole === ROLE_NAMES.SUPERADMIN) {
        // ถ้าเป็น Admin หรือ SuperAdmin ให้ไปที่ Admin Dashboard
        const callbackUrl =
          searchParams.get("callbackUrl") || `/${locale}/admin/dashboard`;
        router.push(callbackUrl);
      } else {
        // ถ้าเป็น Role อื่นๆ ให้ไปที่ Dashboard ของผู้ใช้ทั่วไป
        router.push(`/${locale}/dashboard`);
      }
    }
  };

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center">
      <div className="bg-card w-full max-w-md rounded-lg border p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">
          {t_auth("login.title")}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          {serverError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting
              ? t_common("general.loading")
              : t_auth("login.button")}
          </Button>
        </form>
      </div>
    </div>
  );
}
