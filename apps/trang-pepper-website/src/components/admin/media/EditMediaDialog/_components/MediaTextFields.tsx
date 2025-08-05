// src/components/admin/media/EditMediaDialog/MediaTextFields.tsx
"use client";

import { UseFormRegister } from "react-hook-form";
import type { useTranslations } from "next-intl";

import type { MediaUpdateFormInput } from "@southern-syntax/schemas/media";
import { Input, Label, Textarea } from "@southern-syntax/ui";

interface Props {
  register: UseFormRegister<MediaUpdateFormInput>;
  t: ReturnType<typeof useTranslations>;
}

// interface Props {
//   register: UseFormRegister<MediaUpdateFormInput>;
//   t: ReturnType<typeof useTranslations>;
// }

export function MediaTextFields({ register, t }: Props) {
  return (
    <>
      <div>
        <Label htmlFor="title-en">{t("title_en")}</Label>
        <Input id="title-en" {...register("title.en")} />
      </div>
      <div>
        <Label htmlFor="title-th">{t("title_th")}</Label>
        <Input id="title-th" {...register("title.th")} />
      </div>
      <div>
        <Label htmlFor="altText-en">{t("alt_text_en")}</Label>
        <Input id="altText-en" {...register("altText.en")} />
      </div>
      <div>
        <Label htmlFor="altText-th">{t("alt_text_th")}</Label>
        <Input id="altText-th" {...register("altText.th")} />
      </div>
      <div>
        <Label htmlFor="caption-en">{t("caption_en")}</Label>
        <Textarea id="caption-en" {...register("caption.en")} />
      </div>
      <div>
        <Label htmlFor="caption-th">{t("caption_th")}</Label>
        <Textarea id="caption-th" {...register("caption.th")} />
      </div>
    </>
  );
}
