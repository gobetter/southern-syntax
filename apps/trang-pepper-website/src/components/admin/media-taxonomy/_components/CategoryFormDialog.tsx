// src/app/[lang]/admin/media-taxonomy/_components/CategoryFormDialog.tsx
"use client";

import { useTranslations } from "next-intl";
import { useForm, type SubmitHandler, FormProvider } from "react-hook-form";
import { type MediaCategoryInput } from "@southern-syntax/schemas/media-taxonomy";

import FormFieldError from "@/components/common/FormFieldError";
import { Button, Input, Label } from "@southern-syntax/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@southern-syntax/ui/dialog";

interface CategoryFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  isMutating: boolean;
  formMethods: ReturnType<typeof useForm<MediaCategoryInput>>;
  onSubmit: SubmitHandler<MediaCategoryInput>;
}

export function CategoryFormDialog({
  isOpen,
  onOpenChange,
  isEditing,
  isMutating,
  formMethods,
  onSubmit,
}: CategoryFormDialogProps) {
  const t = useTranslations("admin_media_taxonomy");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = formMethods;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? t("categories.dialog_edit_title")
              : t("categories.dialog_add_title")}
          </DialogTitle>
        </DialogHeader>

        <FormProvider {...formMethods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name-en">
                {t("dialog_shared.name_en_label")}
              </Label>
              <Input id="name-en" {...register("name.en")} />
              <FormFieldError error={errors.name?.en} />
            </div>
            <div>
              <Label htmlFor="name-th">
                {t("dialog_shared.name_th_label")}
              </Label>
              <Input id="name-th" {...register("name.th")} />
              <FormFieldError error={errors.name?.th} />
            </div>
            <div>
              <Label htmlFor="slug">{t("dialog_shared.slug_label")}</Label>
              <Input id="slug" {...register("slug")} />
              <p className="text-muted-foreground text-sm">
                {t("dialog_shared.slug_description")}
              </p>
              <FormFieldError error={errors.slug} />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => onOpenChange(false)}
                >
                  {t("dialog_shared.cancel")}
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isMutating}>
                {t("dialog_shared.save")}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
