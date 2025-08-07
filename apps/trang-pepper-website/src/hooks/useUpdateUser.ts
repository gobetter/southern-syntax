"use client";
import { useTranslations } from "next-intl";

import { trpc } from "@/lib/trpc-client";
import { useToast } from "@southern-syntax/hooks";
import type { UserUpdateOutput } from "@southern-syntax/schemas/user";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "@/server/routers/_app";

interface UseUpdateUserProps {
  onSuccess?: () => void;
}

export function useUpdateUser({ onSuccess }: UseUpdateUserProps = {}) {
  const t_toasts = useTranslations("admin_users.toasts");
  const t_errors = useTranslations("common.error_codes");
  const utils = trpc.useUtils();
  const toast = useToast();

  const updateUserMutation = trpc.user.update.useMutation();

  return {
    updateUser: (params: { id: string; data: UserUpdateOutput }) =>
      updateUserMutation.mutate(params, {
        onSuccess: () => {
          toast.success(t_toasts("update_success"));
          utils.user.getAll.invalidate();
          onSuccess?.();
        },
        onError: (error: TRPCClientErrorLike<AppRouter>) => {
          if (error.message === "CANNOT_DEACTIVATE_SELF") {
            toast.error(t_errors("CANNOT_DEACTIVATE_SELF"));
          } else {
            toast.error(t_toasts("update_error", { error: error.message }));
          }
        },
      }),
    isLoading: updateUserMutation.isPending,
  };
}
