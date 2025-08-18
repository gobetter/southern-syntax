import React from "react";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";

import { authOptions } from "@southern-syntax/auth/server";
import { Toaster } from "@southern-syntax/ui";

import TRPCProvider from "@/lib/trpc-provider";

import SuspenseErrorBoundary from "@/components/common/SuspenseErrorBoundary";
import { ThemeProvider } from "@/components/common/ThemeProvider";

import SessionProviderWrapper from "./SessionProviderWrapper";
// import "@southern-syntax/ui/styles.css"; // ถ้ามีไฟล์นี้ในแพ็กเกจ
import "./globals.css";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const session = await getServerSession(authOptions);
  let session: Session | null = null;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.error("Failed to retrieve session", error);
  }
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value ?? null;

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <TRPCProvider>
          <SessionProviderWrapper session={session}>
            <ThemeProvider theme={theme}>
              <SuspenseErrorBoundary>
                {children}
                <Toaster richColors position="top-right" />
              </SuspenseErrorBoundary>
            </ThemeProvider>
          </SessionProviderWrapper>
        </TRPCProvider>
      </body>
    </html>
  );
}
