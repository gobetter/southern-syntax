// src/hooks/useUploadMedia.ts
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { uploadMediaFile } from '@/lib/upload/uploadMediaFile';
import { TranslatedUploadError } from '@/lib/errors';

interface UploadErrorItem {
  filename: string;
  message: string;
}

export function useUploadMedia(onSuccess: () => void) {
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<UploadErrorItem[]>([]);
  const t = useTranslations('admin_media.upload_dialog');

  const upload = async (files: File[]) => {
    setIsUploading(true);
    setErrors([]);

    const errorItems: UploadErrorItem[] = [];

    for (const file of files) {
      try {
        await uploadMediaFile(file);
      } catch (err) {
        if (err instanceof TranslatedUploadError) {
          // ถ้าเป็น Error ที่เราสร้างไว้ จัดการแบบ Type-safe
          const filename = (err.context?.filename as string) ?? file.name;
          errorItems.push({
            filename: filename,
            message: t(err.messageKey, err.context),
          });
        } else {
          // จัดการ Error ทั่วไปที่ไม่คาดคิด
          errorItems.push({
            filename: file.name,
            message: t('unexpected', { filename: file.name }), // ไม่ต้องส่ง context แล้วถ้าไม่ต้องการ
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
