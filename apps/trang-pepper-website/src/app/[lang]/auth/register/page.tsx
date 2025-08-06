// src/app/[lang]/auth/register/page.tsx

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import RegisterForm from "@/components/auth/RegisterForm";
import { authOptions } from "@southern-syntax/auth";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const session = await getServerSession(authOptions);
  if (session) {
    redirect(`/${lang}/`);
  }
  return <RegisterForm />;
}
