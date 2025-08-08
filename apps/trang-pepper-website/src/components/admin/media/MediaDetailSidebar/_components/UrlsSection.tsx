"use client";

import { useTranslations } from "next-intl";

import { useToast } from "@southern-syntax/hooks";
import { Button } from "@southern-syntax/ui";

// import type { MediaItem } from "@southern-syntax/types";
import { MediaItem } from "@/types/trpc";

export default function UrlsSection({ media }: { media: MediaItem }) {
  const t = useTranslations("admin_media.details");
  const t_success = useTranslations("admin_media.success_messages");
  const toast = useToast();

  const variants = (media.variants || {}) as Record<string, string>;

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success(t_success("url_copied"));
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">{t("urls_title")}</h3>
      {Object.entries(variants).map(([key, url]) => (
        <div key={key} className="flex items-center gap-2">
          <p className="bg-muted flex-1 truncate rounded-md border px-3 py-1.5 font-mono text-xs">
            {url}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCopyUrl(url)}
          >
            {t("copy_url_button")}
          </Button>
        </div>
      ))}
    </div>
  );
}
