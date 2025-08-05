// src/hooks/useUpdateUser.ts
"use client";
import { useTranslations } from "next-intl";

import { trpc } from "@/lib/trpc-client";
import { useToast } from "@/hooks/useToast";
import type { UserUpdateOutput } from "@southern-syntax/schemas/user";

interface UseUpdateUserProps {
  onSuccess?: () => void;
}

export function useUpdateUser({ onSuccess }: UseUpdateUserProps = {}) {
  const t_toasts = useTranslations("admin_users.toasts");
  const t_errors = useTranslations("common.error_codes");
  const utils = trpc.useUtils();
  const toast = useToast();

  const updateUserMutation = trpc.user.update.useMutation({
    onSuccess: () => {
      toast.success(t_toasts("update_success"));
      utils.user.getAll.invalidate();
      onSuccess?.();
    },
    onError: (error) => {
      // ตรวจสอบ error message ที่เรากำหนดเองจาก service
      if (error.message === "CANNOT_DEACTIVATE_SELF") {
        toast.error(t_errors("CANNOT_DEACTIVATE_SELF"));
      } else {
        // ถ้าเป็น error อื่นๆ ให้แสดงข้อความทั่วไป
        toast.error(t_toasts("update_error", { error: error.message }));
      }
    },
  });

  return {
    updateUser: (params: { id: string; data: UserUpdateOutput }) =>
      updateUserMutation.mutate(params),
    isLoading: updateUserMutation.isPending,
  };
}
