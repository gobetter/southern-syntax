"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme?: string | null;
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={theme ?? "system"}
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
