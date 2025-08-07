"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Controller } from "react-hook-form";

import type { MediaItem } from "@/types/trpc";

import { cn } from "@southern-syntax/ui";
import { CheckboxGroup } from "@/components/common/CheckboxGroup";
import {
  Button,
  Label,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@southern-syntax/ui";

import { MediaTextFields } from "./_components/MediaTextFields";
import { useEditMediaForm } from "./useEditMediaForm";

interface EditMediaDialogProps {
  media: MediaItem | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditMediaDialog({
  media,
  isOpen,
  onOpenChange,
}: EditMediaDialogProps) {
  const t = useTranslations("admin_media.edit_dialog");
  const t_filter = useTranslations("admin_media.filter");

  const {
    register,
    handleSubmit,
    control,
    isSubmitting,
    onSubmit,
    categoryOptions,
    tagOptions,
  } = useEditMediaForm({ media, isOpen, onOpenChange });

  if (!media) return null;

  const thumbnailUrl = media.variants?.["thumbnail"] || media.originalUrl;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("sm:max-w-lg", isSubmitting && "cursor-wait")}
      >
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <form id="edit-media-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid max-h-[70vh] gap-4 overflow-y-auto p-1 pr-3">
            <div className="relative mx-auto h-32 w-32 shrink-0">
              <Image
                src={thumbnailUrl}
                alt={media.filename}
                fill
                className="rounded-md object-cover"
                unoptimized
              />
            </div>

            <MediaTextFields register={register} t={t} />

            <div className="space-y-1.5">
              <Label>{t_filter("category_placeholder")}</Label>
              <Controller
                name="categoryIds"
                control={control}
                render={({ field }) => (
                  <CheckboxGroup
                    namePrefix="edit-cat"
                    options={categoryOptions}
                    selectedIds={field.value || []}
                    onChange={(set) => field.onChange(Array.from(set))}
                  />
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label>{t_filter("tag_placeholder")}</Label>
              <Controller
                name="tagIds"
                control={control}
                render={({ field }) => (
                  <CheckboxGroup
                    namePrefix="edit-tag"
                    options={tagOptions}
                    selectedIds={field.value || []}
                    onChange={(set) => field.onChange(Array.from(set))}
                  />
                )}
              />
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            {t("cancel_button")}
          </Button>
          <Button type="submit" form="edit-media-form" disabled={isSubmitting}>
            {isSubmitting ? t("saving_button") : t("save_button")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
