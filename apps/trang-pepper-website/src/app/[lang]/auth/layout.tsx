"use client";

import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // *** ห้าม Render <html> หรือ <body> ที่นี่ ***
    <div className="bg-background flex min-h-screen items-center justify-center">
      {/* อาจจะใส่ styling หรือ container สำหรับหน้า Auth ตรงนี้ */}
      {children}
    </div>
  );
}
