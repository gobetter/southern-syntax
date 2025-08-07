import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { AppRouter } from "@/server/routers/_app";
import { useToast } from "@southern-syntax/hooks";
import { trpc } from "@/lib/trpc-client";
import { TRPCClientErrorLike } from "@trpc/client";
import { MediaItem } from "@/types/trpc";
import { useSelectionSet } from "./useSelectionSet";

// รับ mediaItems เข้ามาเพื่อใช้หา selectedItems
export function useMediaGridManager(mediaItems: MediaItem[]) {
  const t_success = useTranslations("admin_media.success_messages");
  const t_error = useTranslations("admin_media.error_messages");
  const utils = trpc.useUtils();
  const toast = useToast();

  // 1. ย้าย Logic ทั้งหมดมาไว้ที่นี่
  const { selectedIds, toggleSelection, clearSelection } = useSelectionSet();
  const [isBulkEditing, setBulkEditing] = useState(false);

  // const selectedItems = mediaItems.filter((item) => selectedIds.has(item.id));
  const selectedItems = useMemo(
    () => mediaItems.filter((item) => selectedIds.has(item.id)),
    [mediaItems, selectedIds] // ระบุ dependencies ให้ถูกต้อง
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

  // 2. ส่งคืน State และ Functions ทั้งหมดที่ Component ต้องใช้
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
