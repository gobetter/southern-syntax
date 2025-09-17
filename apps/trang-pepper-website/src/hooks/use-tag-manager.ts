"use client";

import { useState, useMemo } from "react";
import { type SubmitHandler, type UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";

import { useToast } from "@southern-syntax/hooks-next/use-toast";
import { type MediaTagInput } from "@southern-syntax/schemas/media-taxonomy";
import type { LocalizedString } from "@southern-syntax/types";
import { mapIdSlugName } from "@southern-syntax/utils";
import type { Tag } from "@southern-syntax/types";

import { trpc } from "@/lib/trpc-client";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "@/server/routers/_app";

interface UseTagManagerProps {
  formMethods: UseFormReturn<MediaTagInput>;
}

export function useTagManager({ formMethods }: UseTagManagerProps) {
  const utils = trpc.useUtils();
  const toast = useToast();
  const t_toasts = useTranslations("admin_media_taxonomy.toasts");
  const t_error_codes = useTranslations("common.error_codes");
  const { reset } = formMethods;

  // --- UI State ---
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [deletingTag, setDeletingTag] = useState<Tag | null>(null);

  // --- tRPC Query and Mutations ---
  const { data: tagsData, isLoading } = trpc.mediaTag.getAll.useQuery();

  const handleMutationSuccess = (
    toastMessageKey: "create_success" | "update_success"
  ) => {
    toast.success(t_toasts(toastMessageKey));
    utils.mediaTag.getAll.invalidate();
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

  const createMutation = trpc.mediaTag.create.useMutation({
    onSuccess: () => handleMutationSuccess("create_success"),
    onError: handleMutationError,
  });

  const updateMutation = trpc.mediaTag.update.useMutation({
    onSuccess: () => handleMutationSuccess("update_success"),
    onError: handleMutationError,
  });

  const deleteMutation = trpc.mediaTag.delete.useMutation({
    onSuccess: () => {
      toast.success(t_toasts("delete_success"));
      utils.mediaTag.getAll.invalidate();
    },
    onError: () => toast.error(t_toasts("delete_error")),
  });

  // --- Derived State ---
  const tags = useMemo<Tag[]>(
    () =>
      mapIdSlugName(
        tagsData as
          | Array<{ id: string; slug: string; name: LocalizedString }>
          | undefined
      ) as Tag[],
    [tagsData]
  );

  // --- Event Handlers ---
  const handleAddNew = () => {
    reset({ name: { en: "", th: "" }, slug: "" });
    setEditingTag(null);
    setDialogOpen(true);
  };

  const handleEdit = (tag: Tag) => {
    reset({
      slug: tag.slug,
      name: tag.name,
    });
    setEditingTag(tag);
    setDialogOpen(true);
  };

  const handleDeleteRequest = (tag: Tag) => {
    setDeletingTag(tag);
  };

  const handleDeleteConfirm = () => {
    if (deletingTag) {
      deleteMutation.mutate({ id: deletingTag.id });
      setDeletingTag(null);
    }
  };

  const onSubmit: SubmitHandler<MediaTagInput> = (data) => {
    const trimmedData: MediaTagInput = {
      slug: data.slug.trim(),
      name: {
        en: data.name.en?.trim() ?? "",
        th: data.name.th?.trim() ?? "",
      },
    };

    if (editingTag?.id) {
      updateMutation.mutate({ id: editingTag.id, data: trimmedData });
    } else {
      createMutation.mutate(trimmedData);
    }
  };

  return {
    tags,
    isLoading,
    isMutating:
      formMethods.formState.isSubmitting ||
      createMutation.isPending ||
      updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isDialogOpen,
    editingTag,
    deletingTag,
    onSubmit,
    handleAddNew,
    handleEdit,
    handleDeleteRequest,
    handleDeleteConfirm,
    setDialogOpen,
    setDeletingTag,
  };
}
