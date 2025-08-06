// src/components/auth/AccessDenied.tsx
"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { TriangleAlert } from "lucide-react";

import { Button } from "@southern-syntax/ui";

export default function AccessDenied() {
  const router = useRouter();
  const t = useTranslations("auth.access_denied");

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <div className="bg-card text-card-foreground rounded-lg border p-8 shadow-sm">
        <TriangleAlert className="text-destructive mx-auto h-12 w-12" />
        <h2 className="mt-4 text-2xl font-bold">{t("title")}</h2>
        <p className="text-muted-foreground mt-2">{t("description")}</p>
        <Button onClick={() => router.back()} className="mt-6">
          {t("go_back_button")}
        </Button>
      </div>
    </div>
  );
}
