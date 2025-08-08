"use client";

import React from "react";
import { useTranslations } from "next-intl";

import ErrorBoundary from "@/components/common/ErrorBoundary";

export default function GlobalError({ reset }: { reset: () => void }) {
  const t = useTranslations("common");

  return (
    <ErrorBoundary>
      <div className="p-4 text-center">
        <h2 className="mb-4 text-xl text-red-600">
          {t("errors.something_went_wrong")}
        </h2>
        <button
          className="rounded bg-blue-500 px-4 py-2 text-white"
          onClick={() => reset()}
        >
          {t("actions.try_again")}
        </button>
      </div>
    </ErrorBoundary>
  );
}
