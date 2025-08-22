"use client";

import {
  useRef,
  useState,
  type FormEvent,
  type ChangeEvent,
  useEffect,
  useCallback,
} from "react";
import { useTranslations } from "next-intl";

import {
  Button,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@southern-syntax/ui";
import Spinner from "@/components/common/spinner";

// Define a generic error type
export interface FileUploadError {
  filename: string;
  message: string;
}

// Props for the generic component
interface FileUploadDialogProps {
  isOpen: boolean;
  onOpenChangeAction: (open: boolean) => void;
  onUploadAction: (files: File[]) => Promise<void>; // Generic upload function
  isUploading: boolean;
  errors: FileUploadError[];
  clearErrorsAction: () => void;
  dialogTitle: string;
}

export default function FileUploadDialog({
  isOpen,
  onOpenChangeAction,
  onUploadAction,
  isUploading,
  errors,
  clearErrorsAction,
  dialogTitle,
}: FileUploadDialogProps) {
  const t = useTranslations("admin_media.upload_dialog");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetFormState = useCallback(() => {
    setSelectedFiles([]);
    clearErrorsAction();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [clearErrorsAction]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
      if (errors.length > 0) {
        clearErrorsAction();
      }
    }
  };

  useEffect(() => {
    // ถ้า Dialog ถูกเปลี่ยนสถานะเป็น "ปิด"
    if (!isOpen) {
      // หน่วงเวลาเล็กน้อยเพื่อให้ Animation การปิดทำงานเสร็จก่อน
      // แล้วค่อยล้างค่าฟอร์ม
      const timer = setTimeout(() => {
        resetFormState();
      }, 200); // 200ms

      // Cleanup function to clear the timer if the component unmounts
      return () => clearTimeout(timer);
    }
  }, [isOpen, resetFormState]); // Hook นี้จะทำงานทุกครั้งที่ค่า isOpen เปลี่ยนไป

  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (selectedFiles.length === 0) return;
    await onUploadAction(selectedFiles);
  };

  const handleClose = () => {
    onOpenChangeAction(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle> {/* Use prop for title */}
        </DialogHeader>
        <form onSubmit={handleFormSubmit} className="flex h-full flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="file-upload">{t("file_upload_label")}</Label>
              <Input
                id="file-upload"
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
                className="cursor-pointer"
                disabled={isUploading}
              />
            </div>
            {selectedFiles.length > 0 && (
              <div className="space-y-2 rounded-md border p-2">
                <p className="text-sm font-medium">
                  {t("items_selected", { count: selectedFiles.length })}
                </p>
                <ul className="text-muted-foreground max-h-32 overflow-y-auto text-sm">
                  {selectedFiles.map((file, index) => (
                    <li key={index} className="truncate" title={file.name}>
                      {file.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {errors.length > 0 && (
              <div className="space-y-1 text-sm text-red-500">
                <p>{t("upload_failed")}</p>
                <ul className="ml-4 list-disc">
                  {errors.map((err, index) => (
                    <li key={index}>
                      <strong>{err.filename}</strong>: {err.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <DialogFooter className="mt-4 shrink-0">
            <DialogClose asChild>
              <Button type="button" variant="secondary" onClick={handleClose}>
                {t("cancel_button")}
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isUploading || selectedFiles.length === 0}
            >
              {isUploading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  {t("uploading_button")}
                </>
              ) : (
                t("upload_button")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
