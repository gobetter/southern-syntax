"use client";

import React from "react";

interface HomePageContentProps {
  t: (key: string) => string;
  currentLang: string; // currentLang จะเป็น 'en' หรือ 'th'
}

export default function HomePageContent({
  t,
  currentLang,
}: HomePageContentProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="mb-8 text-4xl font-bold">{t("general.welcome")}!</h1>
      <h2 className="text-red-400">Hello</h2>
      <p className="mb-4 text-lg">
        {t("language.you_are_visiting_the_website_in_language")}:{" "}
        <span className="font-semibold">
          {t(`language.lang_${currentLang}`)}
        </span>
      </p>
    </div>
  );
}
