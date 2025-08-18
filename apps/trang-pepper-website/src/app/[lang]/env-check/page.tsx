// apps/trang-pepper-website/src/app/[lang]/env-check/page.tsx
"use client";
export default function EnvCheck() {
  return (
    <pre>
      {JSON.stringify(
        {
          NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env
            .NEXT_PUBLIC_SUPABASE_ANON_KEY
            ? "set"
            : "missing",
        },
        null,
        2
      )}
    </pre>
  );
}
