"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "@southern-syntax/ui";

interface ThemeToggleProps {
  initialTheme: string | null;
}

export default function ThemeToggle({ initialTheme }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false); // สร้าง state เพื่อตรวจสอบการ mount
  const { resolvedTheme, setTheme } = useTheme();

  // useEffect จะทำงานเฉพาะบน client เท่านั้น
  // เมื่อมันทำงาน เราก็ตั้งค่า mounted เป็น true
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && resolvedTheme) {
      document.cookie = `theme=${resolvedTheme}; path=/`;
    }
  }, [mounted, resolvedTheme]);

  // ใช้ธีมจาก props ก่อน mount เพื่อหลีกเลี่ยงการกะพริบ
  const icon =
    (mounted ? resolvedTheme : initialTheme) === "dark" ? "☀️" : "🌙";

  // เมื่อ mount แล้ว ค่อยแสดงผลปุ่มที่ถูกต้อง
  return (
    <Button
      variant="ghost"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {/* {resolvedTheme === 'dark' ? '☀️' : '🌙'} */}
      {icon}
    </Button>
  );
}
