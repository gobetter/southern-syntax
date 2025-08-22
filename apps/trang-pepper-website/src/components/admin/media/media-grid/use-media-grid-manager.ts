import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

import { useToast } from "@southern-syntax/hooks-next/use-toast";

import type { AppRouter } from "@/server/routers/_app";
import { trpc } from "@/lib/trpc-client";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { MediaItem } from "@/types/trpc";

import { useSelectionSet } from "./use-selection-set";

// รับ mediaItems เข้ามาเพื่อใช้หา selectedItems
export function useMediaGridManager(mediaItems: MediaItem[]) {
  const t_success = useTranslations("admin_media.success_messages");
  const t_error = useTranslations("admin_media.error_messages");
  const utils = trpc.useUtils();
  const toast = useToast();

  const { selectedIds, toggleSelection, clearSelection } = useSelectionSet();
  const [isBulkEditing, setBulkEditing] = useState(false);

  const selectedItems = useMemo(
    () => mediaItems.filter((item) => selectedIds.has(item.id)),
    [mediaItems, selectedIds]
  );

  const deleteManyMutation = trpc.media.deleteMany.useMutation({
    onSuccess: () => {
      toast.success(t_success("delete_many_success"));
      utils.media.getAll.invalidate();
      clearSelection();
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      toast.error(t_error("delete_many_error", { error: error.message }));
    },
  });

  const handleDeleteSelected = () => {
    deleteManyMutation.mutate({ ids: Array.from(selectedIds) });
  };

  const handleBulkEditSuccess = () => {
    // ปิด Dialog และเคลียร์รายการที่เลือก
    setBulkEditing(false);
    clearSelection();
  };

  return {
    // Selection state
    selectedIds,
    toggleSelection,
    clearSelection,
    selectedItems,

    // Deletion state and handlers
    isDeleting: deleteManyMutation.isPending,
    handleDeleteSelected,

    // Bulk edit state and handlers
    isBulkEditing,
    setBulkEditing,
    handleBulkEditSuccess,
  };
}
