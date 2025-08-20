// import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

// import { authOptions } from "@southern-syntax/auth/server";
import { getServerAuthSession } from "@southern-syntax/auth/server";

import RegisterForm from "@/components/auth/RegisterForm";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  // const session = await getServerSession(authOptions);
  const session = await getServerAuthSession();
  if (session) {
    redirect(`/${lang}/`);
  }
  return <RegisterForm />;
}
