"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { TRPCClientErrorLike } from "@trpc/client";

import { useToast } from "@southern-syntax/hooks-next/use-toast";
import type { MediaItem } from "@/types/trpc";

import type { AppRouter } from "@/server/routers/_app";
import { trpc } from "@/lib/trpc-client";

import ConfirmationDialog from "@/components/common/ConfirmationDialog";

import MediaActionBar from "../MediaActionBar";
import BulkEditDialog from "../BulkEditDialog";

import { useMediaGridManager } from "./useMediaGridManager";
import MediaGridContent from "./_components/MediaGridContent";

interface MediaGridWrapperProps {
  mediaItems: MediaItem[];
  onEditAction: (media: MediaItem) => void;
  onViewDetailsAction: (media: MediaItem) => void;
  onPreviewAction: (media: MediaItem) => void;
}

export default function MediaGridWrapper({
  mediaItems,
  onEditAction,
  onViewDetailsAction,
  onPreviewAction,
}: MediaGridWrapperProps) {
  const t_actionBarDialog = useTranslations(
    "admin_media.action_bar.delete_dialog"
  );
  const t_cardDialog = useTranslations("admin_media.delete_dialog");
  const t_success = useTranslations("admin_media.success_messages");
  const t_error = useTranslations("admin_media.error_messages");

  const utils = trpc.useUtils();
  const toast = useToast();

  const {
    selectedIds,
    toggleSelection,
    clearSelection,
    selectedItems,
    isDeleting: isBulkDeleting, // เปลี่ยนชื่อเพื่อความชัดเจน
    handleDeleteSelected,
    isBulkEditing,
    setBulkEditing,
    handleBulkEditSuccess,
  } = useMediaGridManager(mediaItems);

  // --- State และ Logic สำหรับการลบ "ไฟล์เดียว" ---
  const [deletingMedia, setDeletingMedia] = useState<MediaItem | null>(null);

  const deleteOneMutation = trpc.media.delete.useMutation({
    onSuccess: () => {
      toast.success(t_success("delete_one_success"));
      utils.media.getAll.invalidate();
      setDeletingMedia(null);
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      toast.error(t_error("delete_one_error", { error: error.message }));
      setDeletingMedia(null);
    },
  });

  const handleConfirmDeleteOne = () => {
    if (deletingMedia) {
      deleteOneMutation.mutate({ id: deletingMedia.id });
    }
  };
  // ---------------------------------------------

  const [isBulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);

  return (
    <div>
      {selectedIds.size > 0 && (
        <MediaActionBar
          selectedCount={selectedIds.size}
          onDeleteRequestAction={() => setBulkDeleteConfirmOpen(true)}
          onClearSelectionAction={clearSelection}
          onEditSelectedAction={() => setBulkEditing(true)}
          isDeleting={isBulkDeleting}
        />
      )}

      <MediaGridContent
        mediaItems={mediaItems}
        selectedIds={selectedIds}
        onEditAction={onEditAction}
        onViewDetailsAction={onViewDetailsAction}
        onPreviewAction={onPreviewAction}
        onToggleSelectAction={toggleSelection}
        // ✅ MediaGridWrapper คือ "ผู้สร้าง" และ "ส่งต่อ" ฟังก์ชัน setDeletingMedia
        // ให้กับ Prop ที่ชื่อ onDeleteRequestAction ของ MediaGridContent
        onDeleteRequestAction={setDeletingMedia}
      />

      <BulkEditDialog
        isOpen={isBulkEditing}
        onOpenChangeAction={setBulkEditing}
        mediaIds={Array.from(selectedIds)}
        mediaItems={selectedItems}
        onSuccessAction={handleBulkEditSuccess}
      />

      {/* Dialog สำหรับลบหลายรายการ (Bulk Delete) */}
      <ConfirmationDialog
        open={isBulkDeleteConfirmOpen}
        onOpenChangeAction={setBulkDeleteConfirmOpen}
        title={t_actionBarDialog("title")}
        description={t_actionBarDialog("description", {
          count: selectedIds.size,
        })}
        onConfirmAction={handleDeleteSelected}
        isLoading={isBulkDeleting}
        variant="destructive"
      />

      {/* Dialog สำหรับลบไฟล์เดียว (Single Delete) */}
      <ConfirmationDialog
        open={!!deletingMedia}
        onOpenChangeAction={(open) => !open && setDeletingMedia(null)}
        title={t_cardDialog("title")}
        description={t_cardDialog("description", {
          filename: deletingMedia?.filename ?? "",
        })}
        onConfirmAction={handleConfirmDeleteOne}
        isLoading={deleteOneMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}
