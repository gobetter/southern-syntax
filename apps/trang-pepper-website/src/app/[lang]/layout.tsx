export const dynamic = "force-dynamic";

import React from "react";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import Navbar from "@/components/common/Navbar";
import "../globals.css";

interface Props {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export default async function LocaleLayout({ children, params }: Props) {
  const { lang } = await params;
  const messages = await getMessages({ locale: lang });
  const theme = (await cookies()).get("theme")?.value ?? null;

  return (
    <NextIntlClientProvider locale={lang} messages={messages}>
      <Navbar initialTheme={theme} />
      {children}
    </NextIntlClientProvider>
  );
}
