"use client";

import { useTranslations } from "next-intl";
import FileUploadDialog from "@/components/common/FileUploadDialog";
import { useUploadMedia } from "@/hooks/useUploadMedia";

interface UploadDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadSuccess: () => void;
}

export default function UploadDialog({
  isOpen,
  onOpenChange,
  onUploadSuccess,
}: UploadDialogProps) {
  const t = useTranslations("admin_media.upload_dialog");

  // The hook remains here, providing the specific logic for MEDIA uploads.
  const { upload, isUploading, errors, clearError } = useUploadMedia(() => {
    onUploadSuccess();
    onOpenChange(false); // Let the success callback handle closing
  });

  return (
    <FileUploadDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onUpload={upload} // Pass the specific upload function from the hook
      isUploading={isUploading}
      errors={errors}
      clearErrors={clearError}
      dialogTitle={t("title")} // Provide the specific title
    />
  );
}
