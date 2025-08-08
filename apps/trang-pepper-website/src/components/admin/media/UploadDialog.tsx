"use client";

import { useTranslations } from "next-intl";
import FileUploadDialog from "@/components/common/FileUploadDialog";
import { useUploadMedia } from "@/hooks/useUploadMedia";

interface UploadDialogProps {
  isOpen: boolean;
  onOpenChangeAction: (open: boolean) => void;
  onUploadSuccessAction: () => void;
}

export default function UploadDialog({
  isOpen,
  onOpenChangeAction,
  onUploadSuccessAction,
}: UploadDialogProps) {
  const t = useTranslations("admin_media.upload_dialog");

  // The hook remains here, providing the specific logic for MEDIA uploads.
  const { upload, isUploading, errors, clearError } = useUploadMedia(() => {
    onUploadSuccessAction();
    onOpenChangeAction(false); // Let the success callback handle closing
  });

  return (
    <FileUploadDialog
      isOpen={isOpen}
      onOpenChangeAction={onOpenChangeAction}
      onUploadAction={upload}
      isUploading={isUploading}
      errors={errors}
      clearErrorsAction={clearError}
      dialogTitle={t("title")}
    />
  );
}
