// src/app/[lang]/admin/layout.tsx
import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@southern-syntax/auth/server";
import {
  can,
  PERMISSION_ACTIONS,
  PERMISSION_RESOURCES,
} from "@southern-syntax/auth";

import AdminSidebar from "@/components/admin/AdminSidebar";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import AccessDenied from "@/components/auth/AccessDenied";
import Spinner from "@/components/common/Spinner";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  // params: { lang: string };
  params: Promise<{ lang: string }>;
}) {
  // const resolvedParams = await params;
  const { lang } = await params;
  const session = await getServerSession(authOptions);

  // 1. ✅ ตรวจสอบ Session ที่ Layout Level
  if (!session) {
    // สร้าง callbackUrl แบบไดนามิก
    // (เราอาจจะต้องหาวิธีจัดการ path ที่ซับซ้อนกว่านี้ในอนาคต)
    const callbackUrl = `/admin`;
    return redirect(`/${lang}/auth/signin?callbackUrl=${callbackUrl}`);
    // return redirect(`/${resolvedParams.lang}/auth/signin?callbackUrl=${callbackUrl}`);
  }

  // 2. ✅ ตรวจสอบสิทธิ์การเข้าถึง "ส่วน Admin" โดยรวม
  //    เราจะใช้ permission ADMIN_DASHBOARD:READ เป็นตัวแทน
  const hasAccessToAdmin = can(
    session,
    PERMISSION_RESOURCES.ADMIN_DASHBOARD,
    PERMISSION_ACTIONS.READ
  );

  // 3. ✅ ถ้าไม่มีสิทธิ์ ให้แสดง AccessDenied โดยตรง ไม่ต้องแสดง Layout
  if (!hasAccessToAdmin) {
    return <AccessDenied />;
  }

  // 4. ✅ ถ้ามีสิทธิ์ ถึงจะแสดง Layout ของ Admin
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-6">
        <Breadcrumbs />
        <Suspense fallback={<Spinner />}>{children}</Suspense>
      </main>
    </div>
  );
}

// export default async function AdminLayout({ children, params }: AdminLayoutProps) {
//   const session = await getServerSession(authOptions);

//   if (!session?.user) {
//     const callbackUrl = `/admin`;
//     return redirect(`/${params.lang}/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
//   }

//   const userRole = session.user.role;

//   // เราจะใช้เงื่อนไขเดิมของคุณไปก่อน เพื่อให้เห็นผลที่ตรงกัน
//   const originalIsAuthorized = userRole === ROLE_NAMES.SUPERADMIN || userRole === ROLE_NAMES.ADMIN;

//   if (!originalIsAuthorized) {
//     return <AccessDenied />;
//   }

//   return (
//     <div>
//       <main className="p-4 md:p-6">{children}</main>
//     </div>
//   );
// }
