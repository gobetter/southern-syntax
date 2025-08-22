"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { useTranslations } from "next-intl";
import {
  useForm,
  type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { LocalizedString } from "@southern-syntax/types";
import { useToast } from "@southern-syntax/hooks-next/use-toast";

import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "@/server/routers/_app";
import { trpc } from "@/lib/trpc-client";
import type { Role, Permission } from "@southern-syntax/types";

import type { RoleFormInput, RoleFormOutput } from "./use-role-form";
import { roleFormSchema } from "./use-role-form";

interface UseRoleManagerReturn {
  roles: Role[];
  permissions: Permission[];
  isLoading: boolean;
  isError: boolean;
  error: TRPCClientErrorLike<AppRouter> | null;
  isMutating: boolean;
  isDeleting: boolean;
  isDialogOpen: boolean;
  editingRole: Role | null;
  deletingRole: Role | null;
  onSubmit: SubmitHandler<RoleFormOutput>;
  handleAddNew: () => void;
  handleEdit: (role: Role) => void;
  handleDeleteRequest: (role: Role) => void;
  handleDeleteConfirm: () => void;
  setDialogOpen: Dispatch<SetStateAction<boolean>>;
  setDeletingRole: Dispatch<SetStateAction<Role | null>>;
  formMethods: UseFormReturn<RoleFormInput>;
}

export function useRoleManager(): UseRoleManagerReturn {
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

  const roleQuery = trpc.role.getAll.useQuery();
  const permissionQuery = trpc.permission.getAll.useQuery();

  const roles = roleQuery.data as Role[] | undefined;
  const isLoadingRoles = roleQuery.isLoading;
  const isError = roleQuery.isError;
  const error: TRPCClientErrorLike<AppRouter> | null = roleQuery.error ?? null;

  const permissions = permissionQuery.data as Permission[] | undefined;
  const isLoadingPermissions = permissionQuery.isLoading;

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
      toast.error(t_toasts("update_error"));
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

  const deleteMutation = trpc.role.delete.useMutation();

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
      deleteMutation.mutate(
        { id: deletingRole.id },
        {
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
        }
      );
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
