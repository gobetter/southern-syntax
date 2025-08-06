import React from "react";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

import Navbar from "@/components/common/Navbar";

import "../globals.css";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { lang } = await params;

  // ✅ แก้ไขเป็น: ระบุ locale ที่ต้องการโดยตรง
  const messages = await getMessages({ locale: lang });
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value ?? null;

  return (
    <NextIntlClientProvider locale={lang} messages={messages}>
      <Navbar initialTheme={theme} />
      {children}
    </NextIntlClientProvider>
  );
}
