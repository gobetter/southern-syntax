// ไม่ใช้ next-intl ในไฟล์นี้
"use client";

import { useEffect } from "react";
import { ErrorFallbackUI } from "@/components/common/ErrorFallbackUI";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="p-4 text-center">
      <ErrorFallbackUI />
      <button
        className="mt-4 rounded bg-blue-500 px-4 py-2 text-white"
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  );
}
