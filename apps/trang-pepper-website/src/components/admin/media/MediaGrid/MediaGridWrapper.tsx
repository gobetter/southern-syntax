"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { TRPCClientErrorLike } from "@trpc/client";

import { useToast } from "@southern-syntax/hooks";

import { MediaItem } from "@/types/trpc";
import { AppRouter } from "@/server/routers/_app";
import { trpc } from "@/lib/trpc-client";

import ConfirmationDialog from "@/components/common/ConfirmationDialog";

import MediaActionBar from "../MediaActionBar";
import BulkEditDialog from "../BulkEditDialog";

import { useMediaGridManager } from "./useMediaGridManager";
import MediaGridContent from "./_components/MediaGridContent";

interface MediaGridWrapperProps {
  mediaItems: MediaItem[];
  onEdit: (media: MediaItem) => void;
  onViewDetails: (media: MediaItem) => void;
  onPreview: (media: MediaItem) => void;
}

export default function MediaGridWrapper({
  mediaItems,
  onEdit,
  onViewDetails,
  onPreview,
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
          onDeleteRequest={() => setBulkDeleteConfirmOpen(true)}
          onClearSelection={clearSelection}
          onEditSelected={() => setBulkEditing(true)}
          isDeleting={isBulkDeleting}
        />
      )}

      <MediaGridContent
        mediaItems={mediaItems}
        selectedIds={selectedIds}
        onEdit={onEdit}
        onViewDetails={onViewDetails}
        onPreview={onPreview}
        onToggleSelect={toggleSelection}
        // ✅ MediaGridWrapper คือ "ผู้สร้าง" และ "ส่งต่อ" ฟังก์ชัน setDeletingMedia
        // ให้กับ Prop ที่ชื่อ onDeleteRequest ของ MediaGridContent
        onDeleteRequest={setDeletingMedia}
      />

      <BulkEditDialog
        isOpen={isBulkEditing}
        onOpenChange={setBulkEditing}
        mediaIds={Array.from(selectedIds)}
        mediaItems={selectedItems}
        onSuccess={handleBulkEditSuccess}
      />

      {/* Dialog สำหรับลบหลายรายการ (Bulk Delete) */}
      <ConfirmationDialog
        open={isBulkDeleteConfirmOpen}
        onOpenChange={setBulkDeleteConfirmOpen}
        title={t_actionBarDialog("title")}
        description={t_actionBarDialog("description", {
          count: selectedIds.size,
        })}
        onConfirm={handleDeleteSelected}
        isLoading={isBulkDeleting}
        variant="destructive"
      />

      {/* Dialog สำหรับลบไฟล์เดียว (Single Delete) */}
      <ConfirmationDialog
        open={!!deletingMedia}
        onOpenChange={(open) => !open && setDeletingMedia(null)}
        title={t_cardDialog("title")}
        description={t_cardDialog("description", {
          filename: deletingMedia?.filename ?? "",
        })}
        onConfirm={handleConfirmDeleteOne}
        isLoading={deleteOneMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}
