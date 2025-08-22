"use client";

import React from "react";
import { useTranslations, useLocale } from "next-intl";

import HomePageContent from "@/components/common/home-page-content";

export default function HomePage() {
  const t = useTranslations("common");
  const locale = useLocale();

  return <HomePageContent t={t} currentLang={locale} />;
}
