import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@southern-syntax/auth/server";
import {
  can,
  type PermissionActionType,
  type PermissionResourceType,
} from "@southern-syntax/auth";

import AccessDenied from "./AccessDenied";

interface ProtectedPageProps {
  resource: PermissionResourceType;
  action?: PermissionActionType;
  lang: string;
  callbackUrl: string;
  children: React.ReactNode;
}

export default async function ProtectedPage({
  resource,
  action = "READ", // ถ้าไม่ระบุ action ให้ใช้ 'READ' เป็นค่าเริ่มต้น
  lang,
  callbackUrl,
  children,
}: ProtectedPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return redirect(`/${lang}/auth/signin?callbackUrl=${callbackUrl}`);
  }

  const hasAccess = can(session, resource, action);

  if (!hasAccess) {
    return <AccessDenied />;
  }

  // ถ้ามีสิทธิ์ ให้แสดงเนื้อหาของหน้า (children)
  return <>{children}</>;
}
