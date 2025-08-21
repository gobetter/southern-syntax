"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { uploadMediaFile, TranslatedUploadError } from "@southern-syntax/utils";

interface UploadErrorItem {
  filename: string;
  message: string;
}

export function useUploadMedia(
  onSuccess: () => void,
  namespace = "admin_media.upload_dialog"
) {
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<UploadErrorItem[]>([]);
  const t = useTranslations(namespace);

  const upload = async (files: File[]) => {
    setIsUploading(true);
    setErrors([]);

    const errorItems: UploadErrorItem[] = [];

    for (const file of files) {
      try {
        await uploadMediaFile(file);
      } catch (err) {
        if (err instanceof TranslatedUploadError) {
          const filename = (err.context?.filename as string) ?? file.name;
          errorItems.push({
            filename,
            message: t(err.messageKey, err.context),
          });
        } else {
          errorItems.push({
            filename: file.name,
            message: t("unexpected", { filename: file.name }),
          });
        }
      }
    }

    if (errorItems.length > 0) {
      setErrors(errorItems);
    } else {
      onSuccess();
    }

    setIsUploading(false);
  };

  const clearError = () => setErrors([]);

  return {
    upload,
    isUploading,
    errors,
    clearError,
  };
}
