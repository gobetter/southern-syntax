"use client";

import { useTranslations } from "next-intl";

// import type { MediaItem } from "@southern-syntax/types";
import type { MediaItem } from "@/types/trpc";

import {
  Button,
  Label,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@southern-syntax/ui";

import Spinner from "@/components/common/Spinner";

import { useBulkEdit } from "./useBulkEdit";
import CheckboxGroupWithStates from "./_components/CheckboxGroupWithStates";

interface Props {
  mediaIds: string[];
  mediaItems: MediaItem[];
  isOpen: boolean;
  onOpenChangeAction: (open: boolean) => void;
  onSuccessAction: () => void;
}

export default function BulkEditDialog({
  mediaIds,
  mediaItems,
  isOpen,
  onOpenChangeAction,
  onSuccessAction,
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
    onSuccess: onSuccessAction,
    onClose: () => onOpenChangeAction(false),
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChangeAction}>
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
              onChangeAction={handleCategoryChange}
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label>{t("add_tags_label")}</Label>
            <CheckboxGroupWithStates
              namePrefix="bulk-tag"
              options={tagOptions}
              states={tagStates}
              onChangeAction={handleTagChange}
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
