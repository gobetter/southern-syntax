"use client";

import { useEffect, useMemo } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslations, useLocale } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";

import { trpc } from "@/lib/trpc-client";
import { mapToSelectOptions } from "@southern-syntax/utils";
import {
  userCreateSchema,
  type UserCreateInput,
  type UserCreateOutput,
} from "@southern-syntax/schemas/user";

import { useToast } from "./useToast";
import { LocalizedString } from "@southern-syntax/types";

interface UseAddUserFormProps {
  onOpenChange: (isOpen: boolean) => void;
}

export function useAddUserForm({ onOpenChange }: UseAddUserFormProps) {
  const t_toasts = useTranslations("admin_users.toasts");
  const t_error_codes = useTranslations("common.error_codes");
  const locale = useLocale();
  const utils = trpc.useUtils();
  const toast = useToast();

  const { data: roles, isLoading: isLoadingRoles } =
    trpc.role.getForSelection.useQuery();

  // --- Form Management ---
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, touchedFields },
    trigger,
  } = useForm<UserCreateInput>({
    resolver: zodResolver(userCreateSchema),
    mode: "onChange",
    defaultValues: {
      name: { en: "", th: "" }, // กำหนดให้ name เป็น object,
      email: "",
      password: "",
      roleId: "",
      isActive: true,
    },
  });

  // useEffect เพื่อ re-validate
  useEffect(() => {
    // ถ้าผู้ใช้เคยแตะ (touched) ช่อง confirmPassword แล้ว
    if (touchedFields.confirmPassword) {
      // ให้สั่ง re-validate ช่อง confirmPassword ใหม่
      trigger("confirmPassword");
    }
  }, [touchedFields.confirmPassword, trigger]);

  // const createUserMutation = trpc.user.create.useMutation({
  // const createUserMutation = (trpc.user.create as any).useMutation({
  //   onSuccess: () => {
  //     toast.success(t_toasts("create_success"));
  //     utils.user.getAll.invalidate();
  //     onOpenChange(false); // ปิด Dialog
  //     reset(); // เคลียร์ฟอร์ม
  //   },
  //   // Callback
  //   // onError: (error) => {
  //   onError: (error: any) => {
  //     if (error.message === "INSUFFICIENT_PERMISSIONS_TO_ASSIGN_ROLE") {
  //       toast.error(t_error_codes("INSUFFICIENT_PERMISSIONS_TO_ASSIGN_ROLE"));
  //     } else if (error.message === "EMAIL_ALREADY_EXISTS") {
  //       toast.error(t_error_codes("EMAIL_ALREADY_EXISTS"));
  //     } else {
  //       toast.error(t_toasts("create_error", { error: error.message }));
  //     }
  //   },
  //   // });
  // }) as any;
  const createUserMutation = trpc.user.create.useMutation();

  // onSubmit จะรับข้อมูลที่ผ่านการ Validate แล้วโดย zodResolver
  const onSubmit: SubmitHandler<UserCreateOutput> = (data) => {
    // createUserMutation.mutate(data);
    createUserMutation.mutate(data, {
      onSuccess: () => {
        toast.success(t_toasts("create_success"));
        utils.user.getAll.invalidate();
        onOpenChange(false); // ปิด Dialog
        reset(); // เคลียร์ฟอร์ม
      },
      onError: (error) => {
        if (error.message === "INSUFFICIENT_PERMISSIONS_TO_ASSIGN_ROLE") {
          toast.error(t_error_codes("INSUFFICIENT_PERMISSIONS_TO_ASSIGN_ROLE"));
        } else if (error.message === "EMAIL_ALREADY_EXISTS") {
          toast.error(t_error_codes("EMAIL_ALREADY_EXISTS"));
        } else {
          toast.error(t_toasts("create_error", { error: error.message }));
        }
      },
    });
  };

  const roleOptions = useMemo(
    () =>
      mapToSelectOptions(
        roles as
          | { name: LocalizedString; id: string; key: string }[]
          | undefined,
        locale,
        (r) => r.name,
        (r) => r.key
      ),
    [roles, locale]
  );

  return {
    register,
    handleSubmit,
    control,
    errors,
    reset,
    onSubmit,
    roleOptions, // ส่ง roleOptions ที่แปลงแล้วออกไป
    isLoading: createUserMutation.isPending || isLoadingRoles,
  };
}
