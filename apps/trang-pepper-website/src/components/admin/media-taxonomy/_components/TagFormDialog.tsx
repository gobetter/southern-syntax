"use client";

import { useTranslations } from "next-intl";
import { useForm, type SubmitHandler, FormProvider } from "react-hook-form";

import { type MediaTagInput } from "@southern-syntax/schemas/media-taxonomy";
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

import FormFieldError from "@/components/common/FormFieldError";

interface TagFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  isMutating: boolean;
  formMethods: ReturnType<typeof useForm<MediaTagInput>>;
  onSubmit: SubmitHandler<MediaTagInput>;
}

export function TagFormDialog({
  isOpen,
  onOpenChange,
  isEditing,
  isMutating,
  formMethods,
  onSubmit,
}: TagFormDialogProps) {
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
              ? t("tags.dialog_edit_title")
              : t("tags.dialog_add_title")}
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
