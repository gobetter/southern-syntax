"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import type { ToasterProps } from "sonner";
import * as React from "react";

type ThemeName = NonNullable<ToasterProps["theme"]>;
const isValidTheme = (t: unknown): t is ThemeName =>
  t === "light" || t === "dark" || t === "system";

export function Toaster({ theme, ...props }: ToasterProps) {
  const { theme: sysTheme } = useTheme();

  // ถ้ามี theme จาก props และ valid ใช้ค่านั้น
  // ไม่งั้นลองใช้ของระบบจาก next-themes
  // ถ้ายังไม่ valid อีก ใช้ "system"
  const resolvedTheme: ThemeName = isValidTheme(theme)
    ? theme
    : isValidTheme(sysTheme)
      ? sysTheme
      : "system";

  return (
    <Sonner
      {...props}
      theme={resolvedTheme}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
    />
  );
}
