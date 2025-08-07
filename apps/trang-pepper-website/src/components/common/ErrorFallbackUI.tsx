"use client";

import { useTranslations } from "next-intl";

export function ErrorFallbackUI() {
  const t = useTranslations("common");
  return (
    <div className="border-destructive/50 bg-destructive/10 flex h-full min-h-48 w-full items-center justify-center rounded-md border border-dashed p-4">
      <div className="text-destructive text-center">
        <h3 className="text-lg font-semibold">{t("errors.error_occurred")}</h3>
        <p className="text-sm">{t("errors.something_went_wrong")}</p>
      </div>
    </div>
  );
}
