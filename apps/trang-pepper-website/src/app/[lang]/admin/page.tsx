// src/app/[lang]/admin/page.tsx
import { redirect } from 'next/navigation';

export default async function AdminRootPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  // ส่งต่อไปยังหน้า dashboard โดยใช้ภาษาปัจจุบัน
  redirect(`/${lang}/admin/dashboard`);
}
