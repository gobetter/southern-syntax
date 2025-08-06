"use client";

import { z } from "zod";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc-client";
import { roleSchema } from "@southern-syntax/auth";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "@/server/routers/_app";
import type { inferRouterOutputs } from "@trpc/server";
import { LocalizedString } from "@southern-syntax/types";
import { useToast } from "./useToast";

type RouterOutputs = inferRouterOutputs<AppRouter>;
export type Role = RouterOutputs["role"]["getAll"][number];
export type Permission = RouterOutputs["permission"]["getAll"][number];

// 1. ✅ Export schema และ types ที่นี่
export const roleFormSchema = roleSchema.extend({
  permissionIds: z.array(z.string()),
});
export type RoleFormOutput = z.infer<typeof roleFormSchema>;
export type RoleFormInput = z.input<typeof roleFormSchema>;

export function useRoleManager(): any {
  const utils = trpc.useUtils();
  const toast = useToast();
  const t_toasts = useTranslations("admin_rbac.toasts");
  const t_error_codes = useTranslations("common.error_codes");

  const formMethods = useForm<RoleFormInput>({
    resolver: zodResolver(roleFormSchema),
  });
  const { reset } = formMethods;

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);

  const {
    data: roles,
    isLoading: isLoadingRoles,
    isError,
    error,
  } = trpc.role.getAll.useQuery();
  const { data: permissions, isLoading: isLoadingPermissions } =
    trpc.permission.getAll.useQuery();

  const handleCreateError = (error: TRPCClientErrorLike<AppRouter>) => {
    if (error.message === "ROLE_KEY_EXISTS") {
      toast.error(t_error_codes("ROLE_KEY_EXISTS"));
    } else {
      toast.error(t_toasts("create_error"));
    }
  };

  const handleUpdateError = (error: TRPCClientErrorLike<AppRouter>) => {
    if (error.message === "CANNOT_EDIT_SYSTEM_ROLE") {
      toast.error(t_error_codes("CANNOT_EDIT_SYSTEM_ROLE"));
    } else if (error.message === "ROLE_KEY_EXISTS") {
      toast.error(t_error_codes("ROLE_KEY_EXISTS"));
    } else {
      toast.error(t_toasts("update_error")); // ใช้ข้อความ "update" ที่ถูกต้อง
    }
  };

  const createMutation = trpc.role.create.useMutation({
    onSuccess: () => {
      toast.success(t_toasts("create_success"));
      utils.role.getAll.invalidate();
      setDialogOpen(false);
    },
    onError: handleCreateError,
  });

  const updateMutation = trpc.role.update.useMutation({
    onSuccess: () => {
      toast.success(t_toasts("update_success"));
      utils.role.getAll.invalidate();
      setDialogOpen(false);
    },
    onError: handleUpdateError,
  });

  const deleteMutation = trpc.role.delete.useMutation({
    onSuccess: () => {
      toast.success(t_toasts("delete_success"));
      utils.role.getAll.invalidate();
    },
    onError: (error) => {
      if (error.message === "CANNOT_DELETE_SYSTEM_ROLE") {
        toast.error(t_error_codes("CANNOT_DELETE_SYSTEM_ROLE"));
      } else {
        toast.error(t_toasts("delete_error"));
      }
    },
  });

  const handleAddNew = () => {
    reset({
      key: "",
      name: { en: "", th: "" },
      description: "",
      isSystem: false,
      permissionIds: [],
    });
    setEditingRole(null);
    setDialogOpen(true);
  };

  const handleEdit = (role: Role) => {
    reset({
      key: role.key,
      name: role.name as LocalizedString,
      description: role.description || "",
      permissionIds: role.permissions.map(
        (p: { permissionId: string }) => p.permissionId
      ),
    });
    setEditingRole(role);
    setDialogOpen(true);
  };

  const handleDeleteRequest = (role: Role) => {
    setDeletingRole(role);
  };

  const handleDeleteConfirm = () => {
    if (deletingRole) {
      deleteMutation.mutate({ id: deletingRole.id });
      setDeletingRole(null);
    }
  };

  const onSubmit: SubmitHandler<RoleFormOutput> = (data) => {
    if (editingRole?.id) {
      updateMutation.mutate({ id: editingRole.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return {
    roles: roles ?? [],
    permissions: permissions ?? [],
    isLoading: isLoadingRoles || isLoadingPermissions,
    isError,
    error,
    isMutating:
      formMethods.formState.isSubmitting ||
      createMutation.isPending ||
      updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isDialogOpen,
    editingRole,
    deletingRole,
    onSubmit,
    handleAddNew,
    handleEdit,
    handleDeleteRequest,
    handleDeleteConfirm,
    setDialogOpen,
    setDeletingRole,
    formMethods,
  };
}
