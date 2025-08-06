import { useLocale, useTranslations } from "next-intl";

import { getLocalizedString } from "@southern-syntax/i18n";
import type { MediaItem } from "@/types/trpc";
import type { LocalizedString } from "@southern-syntax/types";

import { Badge, Separator } from "@southern-syntax/ui";

export default function TaxonomySection({ media }: { media: MediaItem }) {
  const t = useTranslations("admin_media.details");
  const locale = useLocale();

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">{t("taxonomy_title")}</h3>
      <div>
        <p className="text-muted-foreground mb-2">{t("category")}</p>
        {media.categories.length > 0 ? (
          // media.categories.map((cat: { id: string; name: unknown }) => (
          media.categories.map((cat: MediaItem["categories"][number]) => (
            <Badge key={cat.id} variant="secondary">
              {getLocalizedString(cat.name as LocalizedString, locale)}
            </Badge>
          ))
        ) : (
          <span>-</span>
        )}
      </div>
      <div>
        <p className="text-muted-foreground mb-2">{t("tags")}</p>
        <div className="flex flex-wrap gap-2">
          {media.tags.length > 0 ? (
            // media.tags.map((tag: { id: string; name: unknown }) => (
            media.tags.map((tag: MediaItem["tags"][number]) => (
              <Badge key={tag.id} variant="secondary">
                {getLocalizedString(tag.name as LocalizedString, locale)}
              </Badge>
            ))
          ) : (
            <span>-</span>
          )}
        </div>
      </div>

      <Separator />
    </div>
  );
}
