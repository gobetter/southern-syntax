// src/hooks/useEditUserForm.ts
"use client";

import { useEffect, useMemo } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations, useLocale } from "next-intl";
import { useSession } from "next-auth/react";

import { trpc } from "@/lib/trpc-client";
import { useToast } from "@/hooks/useToast";
import {
  userUpdateSchema,
  type UserUpdateInput,
  type UserUpdateOutput,
} from "@southern-syntax/schemas/user";
import { UserItem } from "@/types/trpc";
// import { mapRoleOptions } from '@/lib/role-utils';
import { mapToSelectOptions } from "@southern-syntax/utils";
// import type { RoleItem } from '@/types/trpc';
import type { LocalizedString } from "@southern-syntax/types";

// Helper function: แปลงข้อมูล User ที่ได้จาก DB ให้อยู่ในรูปแบบที่ฟอร์มต้องการ
function userToFormValues(user: UserItem): UserUpdateInput {
  return {
    name: (user.name as LocalizedString) || { en: "", th: "" },
    email: user.email,
    roleId: user.role?.id,
    isActive: user.isActive,
    password: "", // Password เริ่มต้นเป็นค่าว่างเสมอ
  };
}

interface UseEditUserFormProps {
  user: UserItem | null;
  onSuccess: () => void;
}

export function useEditUserForm({ user, onSuccess }: UseEditUserFormProps) {
  const t_toasts = useTranslations("admin_users.toasts");
  const t_error_codes = useTranslations("common.error_codes");
  const locale = useLocale();
  const utils = trpc.useUtils();
  const toast = useToast();

  // ดึงข้อมูล session ปัจจุบันและฟังก์ชัน update มาด้วย
  const { data: currentSession, update: updateSession } = useSession();
  const { data: roles, isLoading: isLoadingRoles } =
    trpc.role.getForSelection.useQuery();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, touchedFields },
    trigger,
  } = useForm<UserUpdateInput>({
    resolver: zodResolver(userUpdateSchema),
    mode: "onChange",
  });

  // Effect สำหรับ set ค่าเริ่มต้นให้ฟอร์มเมื่อ user object เปลี่ยนไป
  useEffect(() => {
    if (user) {
      reset(userToFormValues(user));
    }
  }, [user, reset]);

  // useEffect เพื่อ re-validate
  useEffect(() => {
    // ถ้าผู้ใช้เคยแตะ (touched) ช่อง confirmPassword แล้ว
    if (touchedFields.confirmPassword) {
      // ให้สั่ง re-validate ช่อง confirmPassword ใหม่
      trigger("confirmPassword");
    }
  }, [touchedFields.confirmPassword, trigger]);

  const updateUserMutation = trpc.user.update.useMutation({
    // onSuccess จะได้รับ `updatedUser` ที่ server ส่งกลับมา
    onSuccess: async (updatedUser) => {
      toast.success(t_toasts("update_success"));
      utils.user.getAll.invalidate();

      // ตรวจสอบว่าผู้ใช้ที่กำลังแก้ไขคือคนเดียวกับที่ล็อกอินอยู่หรือไม่
      // if (currentSession?.user?.id === updatedUser.id) {
      //   // ถ้าใช่, ให้ทำการอัปเดต session โดยส่งข้อมูลใหม่เข้าไปโดยตรง
      //   await updateSession({
      //     ...currentSession!,
      //     user: {
      //       ...currentSession!.user,
      //       name: updatedUser.name, // อัปเดตแค่ชื่อ (หรือฟิลด์อื่นๆ ที่ต้องการ)
      //     },
      //   });
      // }

      if (currentSession?.user?.id === updatedUser.id) {
        await updateSession({
          ...currentSession,
          user: { ...currentSession.user, name: updatedUser.name },
        });
      }

      onSuccess();
    },
    onError: (error) => {
      // toast.error(t_toasts('update_error', { error: error.message }));
      if (error.message === "INSUFFICIENT_PERMISSIONS_TO_ASSIGN_ROLE") {
        toast.error(t_error_codes("INSUFFICIENT_PERMISSIONS_TO_ASSIGN_ROLE"));
      } else if (error.message === "CANNOT_CHANGE_OWN_ROLE") {
        toast.error(t_error_codes("CANNOT_CHANGE_OWN_ROLE"));
      } else {
        toast.error(t_toasts("update_error", { error: error.message }));
      }
    },
  });

  const onSubmit: SubmitHandler<UserUpdateOutput> = (data) => {
    if (!user) return;
    updateUserMutation.mutate({ id: user.id, data });
  };

  // const roleOptions = useMemo(
  //   () => mapRoleOptions(roles as RoleItem[] | undefined, locale),
  //   [roles, locale],
  // );

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
    onSubmit,
    roleOptions,
    isLoading: updateUserMutation.isPending || isLoadingRoles,
    reset,
  };
}
