// src/components/admin/media/BulkEditDialog/BulkEditDialog.tsx
"use client";

import { useTranslations } from "next-intl";

import type { MediaItem } from "@/types/trpc";

import { Label } from "@southern-syntax/ui/label";
import Spinner from "@/components/common/Spinner";
import { Button } from "@southern-syntax/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@southern-syntax/ui/dialog";

import CheckboxGroupWithStates from "./_components/CheckboxGroupWithStates";
import { useBulkEdit } from "./useBulkEdit";

interface Props {
  mediaIds: string[];
  mediaItems: MediaItem[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function BulkEditDialog({
  mediaIds,
  mediaItems,
  isOpen,
  onOpenChange,
  onSuccess,
}: Props) {
  const t = useTranslations("admin_media.bulk_edit_dialog");
  const t_filter = useTranslations("admin_media.filter");

  const {
    isMutating,
    categoryOptions,
    tagOptions,
    categoryStates,
    tagStates,
    handleSave,
    handleCategoryChange,
    handleTagChange,
  } = useBulkEdit({
    mediaItems,
    mediaIds,
    isOpen,
    onSuccess,
    onClose: () => onOpenChange(false),
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title", { count: mediaIds.length })}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex flex-col space-y-1.5">
            <Label>{t_filter("category_placeholder")}</Label>
            <CheckboxGroupWithStates
              namePrefix="bulk-cat"
              options={categoryOptions}
              states={categoryStates}
              onChange={handleCategoryChange}
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label>{t("add_tags_label")}</Label>
            <CheckboxGroupWithStates
              namePrefix="bulk-tag"
              options={tagOptions}
              states={tagStates}
              onChange={handleTagChange}
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              {t("cancel")}
            </Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={isMutating}>
            {isMutating && <Spinner className="mr-2 h-4 w-4" />}
            {t("save_changes")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
