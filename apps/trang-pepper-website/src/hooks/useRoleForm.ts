"use client";

import { useEffect } from "react";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { TRPCClientErrorLike } from "@trpc/client";

import { roleSchema } from "@southern-syntax/auth";
import { LocalizedString } from "@southern-syntax/types";
import { useToast } from "@southern-syntax/hooks";

import { trpc } from "@/lib/trpc-client";
import { Role } from "@/types/role";
import type { AppRouter } from "@/server/routers/_app";

export const roleFormSchema = roleSchema.extend({
  permissionIds: z.array(z.string()),
});
export type RoleFormOutput = z.infer<typeof roleFormSchema>;
export type RoleFormInput = z.input<typeof roleFormSchema>;

interface UseRoleFormProps {
  editingRole: Role | null;
  onSuccess: () => void;
}

export function useRoleForm({ editingRole, onSuccess }: UseRoleFormProps) {
  const utils = trpc.useUtils();
  const toast = useToast();
  const t_toasts = useTranslations("admin_rbac.toasts");
  const t_error_codes = useTranslations("common.error_codes");

  const formMethods = useForm<RoleFormInput>({
    resolver: zodResolver(roleFormSchema),
  });
  const { reset } = formMethods;

  useEffect(() => {
    if (editingRole) {
      reset({
        key: editingRole.key,
        name: editingRole.name as LocalizedString,
        description: editingRole.description || "",
        isSystem: editingRole.isSystem,
        permissionIds: editingRole.permissions.map(
          (p: { permissionId: string }) => p.permissionId
        ),
      });
    } else {
      reset({
        key: "",
        name: { en: "", th: "" },
        description: "",
        permissionIds: [],
      });
    }
  }, [editingRole, reset]);

  const handleMutationError = (error: TRPCClientErrorLike<AppRouter>) => {
    if (error.message === "ROLE_KEY_EXISTS") {
      toast.error(t_error_codes("ROLE_KEY_EXISTS"));
    } else {
      toast.error(t_toasts("create_error"));
    }
  };

  const createMutation = trpc.role.create.useMutation({
    onSuccess: () => {
      toast.success(t_toasts("create_success"));
      utils.role.getAll.invalidate();
      onSuccess();
    },
    onError: handleMutationError,
  });

  const updateMutation = trpc.role.update.useMutation({
    onSuccess: () => {
      toast.success(t_toasts("update_success"));
      utils.role.getAll.invalidate();
      onSuccess();
    },
    onError: handleMutationError,
  });

  const onSubmit: SubmitHandler<RoleFormInput> = (data) => {
    if (editingRole?.id) {
      updateMutation.mutate({ id: editingRole.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return {
    formMethods,
    onSubmit,
    isLoading: createMutation.isPending || updateMutation.isPending,
  };
}
