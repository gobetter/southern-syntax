// apps/trang-pepper-website/src/app/layout.tsx

import React from "react";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";

import TRPCProvider from "@/lib/trpc-provider";
// import { authOptions } from "@southern-syntax/auth";
import { authOptions } from "@southern-syntax/auth/server";
import { Toaster } from "@southern-syntax/ui";

import SuspenseErrorBoundary from "@/components/common/SuspenseErrorBoundary";
import { ThemeProvider } from "@/components/common/ThemeProvider";

import SessionProviderWrapper from "./SessionProviderWrapper";
import "./globals.css";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
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
