"use client";

import { useTranslations } from "next-intl";
import type { useForm } from "react-hook-form";
import { type SubmitHandler, FormProvider } from "react-hook-form";
import { type MediaCategoryInput } from "@southern-syntax/schemas/media-taxonomy";
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

import FormFieldError from "@/components/common/form-field-error";

interface CategoryFormDialogProps {
  isOpen: boolean;
  onOpenChangeAction: (open: boolean) => void;
  isEditing: boolean;
  isMutating: boolean;
  formMethods: ReturnType<typeof useForm<MediaCategoryInput>>;
  onSubmitAction: SubmitHandler<MediaCategoryInput>;
}

export function CategoryFormDialog({
  isOpen,
  onOpenChangeAction,
  isEditing,
  isMutating,
  formMethods,
  onSubmitAction,
}: CategoryFormDialogProps) {
  const t = useTranslations("admin_media_taxonomy");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = formMethods;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChangeAction}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? t("categories.dialog_edit_title")
              : t("categories.dialog_add_title")}
          </DialogTitle>
        </DialogHeader>

        <FormProvider {...formMethods}>
          <form onSubmit={handleSubmit(onSubmitAction)} className="space-y-4">
            <div>
              <Label htmlFor="name-en">
                {t("dialog_shared.name_en_label")}
              </Label>
              <Input id="name-en" {...register("name.en")} />
              <FormFieldError error={errors.name?.en ?? null} />
            </div>
            <div>
              <Label htmlFor="name-th">
                {t("dialog_shared.name_th_label")}
              </Label>
              <Input id="name-th" {...register("name.th")} />
              <FormFieldError error={errors.name?.en ?? null} />
            </div>
            <div>
              <Label htmlFor="slug">{t("dialog_shared.slug_label")}</Label>
              <Input id="slug" {...register("slug")} />
              <p className="text-muted-foreground text-sm">
                {t("dialog_shared.slug_description")}
              </p>
              <FormFieldError error={errors.name?.en ?? null} />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => onOpenChangeAction(false)}
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
