// src/hooks/useCategoryManager.ts
"use client";

import { useState, useMemo } from "react";
import { type SubmitHandler, type UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc-client";
import { useToast } from "@southern-syntax/hooks";
import { type MediaCategoryInput } from "@southern-syntax/schemas/media-taxonomy";
import type { LocalizedString } from "@southern-syntax/types";
import { mapIdSlugName } from "@southern-syntax/utils";
import { Category } from "@southern-syntax/types";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "@/server/routers/_app";

// Interface สำหรับ Props ของ Hook
interface UseCategoryManagerProps {
  formMethods: UseFormReturn<MediaCategoryInput>;
}

export function useCategoryManager({ formMethods }: UseCategoryManagerProps) {
  const utils = trpc.useUtils();
  const toast = useToast();
  const t_toasts = useTranslations("admin_media_taxonomy.toasts");
  const t_error_codes = useTranslations("common.error_codes");
  const { reset } = formMethods;

  // --- UI State ---
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null
  );

  // --- tRPC Query and Mutations ---
  const { data: categoriesData, isLoading } =
    trpc.mediaCategory.getAll.useQuery();

  const handleMutationSuccess = (
    toastMessageKey: "create_success" | "update_success"
  ) => {
    toast.success(t_toasts(toastMessageKey));
    utils.mediaCategory.getAll.invalidate();
    setDialogOpen(false);
  };

  const handleMutationError = (error: TRPCClientErrorLike<AppRouter>) => {
    if (error.message === "SLUG_ALREADY_EXISTS") {
      toast.error(t_error_codes("SLUG_ALREADY_EXISTS"));
    } else if (error.message === "NAME_ALREADY_EXISTS") {
      toast.error(t_error_codes("NAME_ALREADY_EXISTS"));
    } else {
      toast.error(t_toasts("create_error"));
    }
  };

  const createMutation = trpc.mediaCategory.create.useMutation({
    onSuccess: () => handleMutationSuccess("create_success"),
    onError: handleMutationError,
  });

  const updateMutation = trpc.mediaCategory.update.useMutation({
    onSuccess: () => handleMutationSuccess("update_success"),
    onError: handleMutationError,
  });

  const deleteMutation = trpc.mediaCategory.delete.useMutation({
    onSuccess: () => {
      toast.success(t_toasts("delete_success"));
      utils.mediaCategory.getAll.invalidate();
    },
    onError: () => toast.error(t_toasts("delete_error")),
  });

  // --- Derived State ---
  const categories = useMemo<Category[]>(
    () =>
      mapIdSlugName(
        categoriesData as
          | Array<{ id: string; slug: string; name: LocalizedString }>
          | undefined
      ) as Category[],
    [categoriesData]
  );

  // --- Event Handlers ---
  const handleAddNew = () => {
    reset({ name: { en: "", th: "" }, slug: "" });
    setEditingCategory(null);
    setDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    reset({
      slug: category.slug,
      name: category.name,
    });
    setEditingCategory(category);
    setDialogOpen(true);
  };

  const handleDeleteRequest = (category: Category) => {
    setDeletingCategory(category);
  };

  const handleDeleteConfirm = () => {
    if (deletingCategory) {
      deleteMutation.mutate({ id: deletingCategory.id });
      setDeletingCategory(null);
    }
  };

  const onSubmit: SubmitHandler<MediaCategoryInput> = (data) => {
    const trimmedData = {
      ...data,
      name: {
        en: data.name.en?.trim(),
        th: data.name.th?.trim(),
      },
    };

    if (editingCategory?.id) {
      updateMutation.mutate({ id: editingCategory.id, data: trimmedData });
    } else {
      createMutation.mutate(trimmedData);
    }
  };

  return {
    categories,
    isLoading,
    isMutating:
      formMethods.formState.isSubmitting ||
      createMutation.isPending ||
      updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isDialogOpen,
    editingCategory,
    deletingCategory,
    onSubmit,
    handleAddNew,
    handleEdit,
    handleDeleteRequest,
    handleDeleteConfirm,
    setDialogOpen,
    setDeletingCategory,
  };
}
