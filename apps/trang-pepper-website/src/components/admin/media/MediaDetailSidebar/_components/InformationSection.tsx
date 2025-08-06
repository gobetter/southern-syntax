import { useLocale, useTranslations } from "next-intl";

import type { MediaItem } from "@/types/trpc";
import { Separator } from "@southern-syntax/ui";

export default function InformationSection({ media }: { media: MediaItem }) {
  const t = useTranslations("admin_media.details");
  const locale = useLocale();

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">{t("information_title")}</h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <span className="text-muted-foreground">{t("file_type")}</span>
        <span>{media.mimeType}</span>
        <span className="text-muted-foreground">{t("file_size")}</span>
        <span>{(media.fileSize / 1024).toFixed(2)} KB</span>
        <span className="text-muted-foreground">{t("uploaded_at")}</span>
        <span>{new Date(media.createdAt).toLocaleString(locale)}</span>
      </div>

      <Separator />
    </div>
  );
}
