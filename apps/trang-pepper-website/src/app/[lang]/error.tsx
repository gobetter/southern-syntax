"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { ErrorFallbackUI } from "@/components/common/ErrorFallbackUI";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="p-4 text-center">
      <ErrorFallbackUI
        title={t("errors.error_occurred")}
        message={t("errors.something_went_wrong")}
      />
      <button
        className="mt-4 rounded bg-blue-500 px-4 py-2 text-white"
        onClick={() => reset()}
      >
        {t("actions.try_again")}
      </button>
    </div>
  );
}
