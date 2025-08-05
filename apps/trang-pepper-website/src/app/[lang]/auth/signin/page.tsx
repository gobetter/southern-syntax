import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@southern-syntax/auth";
import SignInForm from "@/components/auth/SignInForm";

export default async function SignInPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const session = await getServerSession(authOptions);
  if (session) {
    redirect(`/${lang}/`);
  }
  return <SignInForm />;
}
